import BaseService from '../base-service.js';
import Result from '../../model/shared/result.js';
import { VALIDATION_ERROR } from '../../error-types.js';

export default class CreditCardService extends BaseService {
  validate( { number, expirationDate, cvv } ) {
    const errors = [];

    if ( !this.#validateNumber( number ) )
      errors.push( 'Invalid credit card number.' );
    if ( !this.#validateExpirationDate( expirationDate ) )
      errors.push( 'Invalid credit card expiration date.' );
    if ( !this.#validateCvv( cvv ) )
      errors.push( 'Invalid credit card cvc.' );

    if ( errors.length !== 0 )
      return Result.failure( VALIDATION_ERROR, ...errors );

    return Result.success();
  }

  #validateNumber( number ) {
    const length = number.length;
    
    if ( length < 13 || length > 19 ) return false;
    
    let sum = 0;
    let isEven = false;
    
    for ( let i = number.length - 1; i >= 0; i-- ) {
      let digit = number[ i ];
      
      if ( isEven ) {
        digit *= 2;
        if ( digit > 9 ) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  #validateExpirationDate( expirationDate ) {
    const [ month, year ] = expirationDate.split( '/' ).map( Number );
    const now = new Date();
    const date = new Date( year, month - 1, 1 );
    
    return (
      month >= 1 &&
      month <= 12 &&
      year >= now.getFullYear() &&
      date >= new Date( now.getFullYear(), now.getMonth(), 1 )
    );
  }

  #validateCvv( cvv ) {
    return /^\d{3,4}$/.test( cvv );
  }
  
  async findOrCreate( data ) {
    const result = await this.modelRepository.findOrCreate( data );

    if ( result.isFailure ) return result;

    const [ creditCard ] = result.value;
    return Result.success( creditCard );
  }
}
