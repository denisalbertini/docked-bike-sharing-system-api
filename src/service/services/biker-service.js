import BaseService from '../base-service.js';
import Result from '../../model/shared/result.js';
import {
  AUTHENTICATION_ERROR,
  INTERNAL_SERVER_ERROR,
  PRECONDITION_FAILED_ERROR, 
  VALIDATION_ERROR
} from '../../error-types.js';
import status from '../../model/shared/enum/biker-status.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { ACCESS } from '../../auth-purpose.js';

const jwtAsyncSign = promisify( jwt.sign );

export default class BikerService extends BaseService {
  validate(
    {
      foreigner, 
      cpf, 
      passportNumber, 
      countryCode, 
      password, 
      confirmationPassword
    }
  ) {
    const errors = [];
    
    if ( !foreigner && !cpf )
      errors.push( 'CPF is mandatory for locals.' );

    if ( foreigner && ( !passportNumber || !countryCode ) )
      errors.push( 'Passport data is mandatory for foreigners.' );

    if ( confirmationPassword && ( password !== confirmationPassword ) )
      errors.push( 'Passwords must match.' );

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
        { bikerId: biker.id, purpose: 'email_verification' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
      );

      return Result.success( token );
    } catch (error) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }

  async activateAccount( id ) {
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

      return Result.success( token );
    } catch ( error ) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
