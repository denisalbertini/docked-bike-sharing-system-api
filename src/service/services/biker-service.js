import BaseService from '../base-service.js';
import Result from '../../model/shared/result.js';
import {
  NOT_FOUND_ERROR, 
  PRECONDITION_FAILED_ERROR, 
  VALIDATION_ERROR
} from '../../error-types.js';
import status from '../../model/shared/enum/biker-status.js';
import bcrypt from 'bcryptjs';

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

  create( data ) {
    const hashedPassword = bcrypt.hashSync( data.password, 10 );
    super.create( { ...data, password: hashedPassword } );
  }

  async activateAccount( id ) {
    const accountPendingResult = await this.isAccountPending( id );
    if ( accountPendingResult.isFailure ) return accountPendingResult;

    return await this.updateById( id, { status: status.ACTIVE } );
  }

  async isAccountPending( id ) {
    const findResult = await this.findById( id );
    if ( findResult.isFailure ) return findResult;

    const biker = findResult.value;

    if ( biker === null )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Account does not exist.'
      );

    if ( biker.status !== status.PENDING )
      return Result.failure(
        PRECONDITION_FAILED_ERROR, 
        'Account is not pending.'
      );

    return Result.success();
  }
}
