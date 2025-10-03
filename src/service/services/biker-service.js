import BaseService from '../base-service.js';
import Result from '../../model/shared/result.js';
import { NOT_FOUND_ERROR, VALIDATION_ERROR } from '../../error-types.js';
import status from '../../model/shared/enum/biker-status.js';

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
      return Result.failure( errors, VALIDATION_ERROR );

    return Result.success();
  }

  async activateAccount( id ) {
    const findResult = await this.findById( id );
    if ( findResult.isFailure ) return findResult;

    const biker = findResult.value;
    if ( biker === null || biker.status !== status.PENDING )
      return Result.failure(
        [ 'Entry is not confirmation pending.' ], 
        NOT_FOUND_ERROR
      );

    const updateResult = await this.updateById( id, { status: status.ACTIVE } );
    
    return updateResult;
  }
}
