import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { ACCESS, EMAIL_VERIFICATION } from '../../model/shared/enum/auth-purpose.js';
import status from '../../model/shared/enum/biker-status.js';
import {
  AUTHENTICATION_ERROR,
  FORBIDDEN_ERROR,
  INTERNAL_SERVER_ERROR,
  PRECONDITION_FAILED_ERROR,
  VALIDATION_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseService from '../base-service.js';

const jwtAsyncSign = promisify( jwt.sign );
const jwtAsyncVerify = promisify( jwt.verify );

export default class BikerService extends BaseService {
  constructor( bikerRepository ) { super( bikerRepository ); }
  
  validate(
    {
      foreigner, 
      cpf, 
      passportNumber, 
      expirationDate, 
      countryCode, 
      password, 
      confirmationPassword, 
      update = false
    }
  ) {
    const errors = [];

    if ( !update && !foreigner && !cpf )
      errors.push( 'CPF is mandatory for locals.' );

    if ( foreigner && cpf )
      errors.push( 'Foreigners cannot have a cpf.' );

    if ( foreigner && ( !passportNumber || !expirationDate || !countryCode ) )
      errors.push( 'Passport data is mandatory for foreigners.' );

    if (!update) {
      if (password !== confirmationPassword)
        errors.push('Passwords do not match.');
    } else {
      if ( ( password || confirmationPassword ) && password !== confirmationPassword )
        errors.push('Passwords do not match.');
    }

    if ( errors.length > 0 )
      return Result.failure( VALIDATION_ERROR, ...errors );

    return Result.success();
  }

  async create( data ) {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash( data.password, 10 );
    } catch ( error ) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }

    return super.create( { ...data, password: hashedPassword } );
  }

  async generateAccountConfirmationToken( biker ) {
    try {
      const token = await jwtAsyncSign(
        { id: biker.id, purpose: EMAIL_VERIFICATION }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
      );

      return Result.success( token );
    } catch (error) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }

  async activateAccount( id, token ) {
    try {
      const payload = await jwtAsyncVerify( token, process.env.JWT_SECRET );

      if ( payload.id !== id || payload.purpose !== EMAIL_VERIFICATION )
        return Result.failure( FORBIDDEN_ERROR, 'Invalid email confirmation request.' );
    } catch (error) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
    
    const findResult = await this.findById( id );
    if ( findResult.isFailure ) return findResult;

    const biker = findResult.value;
    if ( biker.status !== status.PENDING )
      return Result.failure( PRECONDITION_FAILED_ERROR, 'Account not pending.' );

    return await this.updateById( id, { status: status.ACTIVE } );
  }

  async login( { email, password } ) {
    const findResult = await this._modelRepository.findByEmail( email );
    if ( findResult.isFailure ) return findResult;

    const biker = findResult.value;

    try {
      const checksOut = await bcrypt.compare( password, biker.password );

      if ( !checksOut )
        return Result.failure( AUTHENTICATION_ERROR, 'Incorrect credentials.' );
      
      const token = await jwtAsyncSign(
        { id: biker.id, purpose: ACCESS }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      return Result.success( { token } );
    } catch ( error ) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }

  async updateById( id, data ) {
    if ( data.password ) {
      try {
        var hashedPassword = await bcrypt.hash( data.password, 10 );
      } catch ( error ) {
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );
      }
    }

    return super.updateById( id, { ...data, password: hashedPassword ?? data.password } );
  }
}
