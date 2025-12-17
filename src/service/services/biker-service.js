import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { ACCESS, EMAIL_VERIFICATION } from '../../model/shared/enum/auth-purpose.js';
import status from '../../model/shared/enum/biker-status.js';
import {
    AUTHENTICATION_ERROR,
    BAD_REQUEST_ERROR,
    FORBIDDEN_ERROR,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseService from '../base-service.js';

const jwtAsyncSign = promisify( jwt.sign );
const jwtAsyncVerify = promisify( jwt.verify );

export default class BikerService extends BaseService {
  constructor( bikerRepository ) { super( bikerRepository ); }
  
  validateBeforeCreate( bikerData, passportData = null ) {
    const errors = [];

    if ( !bikerData.cpf && !passportData )
      errors.push( 'Biker must have a document.' );

    if ( bikerData.cpf && passportData )
      errors.push( 'Biker can only have one document.' );

    if ( bikerData.password !== bikerData.confirmationPassword )
      errors.push( 'Passwords do not match.' );

    if ( errors.length > 0 ) return Result.failure(
      BAD_REQUEST_ERROR, ...errors
    );

    return Result.success();
  }

  async #hashPassword( password ) {
    try {
      const hashedPassword = await bcrypt.hash( password, 10 );
      return Result.success( hashedPassword );
    } catch ( error ) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }

  async create( data, transaction = null ) {
    const hashPasswordResult = await this.#hashPassword( data.password );
    if ( hashPasswordResult.isFailure ) return hashPasswordResult;
    const hashedPassword = hashPasswordResult.value;

    return super.create(
      { ...data, password: hashedPassword }, 
      ...( ( transaction && [ transaction ] ) ?? [] )
    );
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
      return Result.failure( BAD_REQUEST_ERROR, 'Account not pending.' );

    return await this.updateById( id, { status: status.ACTIVE } );
  }

  async login( email, password ) {
    const findResult = await this._modelRepository.findByEmailAndActiveStatus( email );
    if ( findResult.isSuccess && findResult.value === null )
      return Result.failure( NOT_FOUND_ERROR, 'Account does not exist.' );
    else if ( findResult.isFailure ) return findResult;

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

  async validateBeforeUpdate( bikerId, bikerData, passportData = null ) {
    const errors = [];
    
    if ( bikerData.cpf ) errors.push( 'CPF cannot be modified.' );

    if ( passportData ) {
      const findBikerResult = await this.findById( bikerId );
      if ( findBikerResult.isFailure ) return findBikerResult;
      const biker = findBikerResult.value;

      if ( biker.cpf ) errors.push( 'Biker already has a document.' );
    }

    if (
      bikerData.password && 
      bikerData.password !== bikerData.confirmationPassword
    ) errors.push( 'Passwords do not match' );

    if ( errors.length > 0 ) return Result.failure(
      BAD_REQUEST_ERROR, ...errors
    );

    return Result.success();
  }

  async updateById( id, data, transaction = null ) {
    if ( data.password ) {
      const hashPasswordResult = await this.#hashPassword( data.password );
      if ( hashPasswordResult.isFailure ) return hashPasswordResult;
      var hashedPassword = hashPasswordResult.value;
    }

    return super.updateById(
      id, 
      { ...data, password: hashedPassword ?? data.password }, 
      ...( ( transaction && [ transaction ] ) ?? [] )
    );
  }
}
