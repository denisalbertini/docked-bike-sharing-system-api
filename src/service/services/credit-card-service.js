import BaseService from '../base-service.js';
import Result from '../../model/shared/result.js';
import { VALIDATION_ERROR } from '../../model/shared/enum/error-types.js';

export default class CreditCardService extends BaseService {
  constructor( creditCardRepository ) { super( creditCardRepository ); }
  
  validate( { creditCardNumber, expirationDate, cvv } ) {
    const errors = [];

    if ( !this.#validateNumber( creditCardNumber ) )
      errors.push( 'Invalid credit card number.' );
    if ( !this.#validateExpirationDate( expirationDate ) )
      errors.push( 'Invalid credit card expiration date.' );
    if ( !this.#validateCvv( cvv ) )
      errors.push( 'Invalid credit card cvv.' );

    if ( errors.length !== 0 )
      return Result.failure( VALIDATION_ERROR, ...errors );

    return Result.success();
  }

  #validateNumber( creditCardNumber ) {
    const cleanNumber = creditCardNumber
      .toString()
      .replace( /\s/g, '' )
      .split( '' )
      .reverse()
      .join( '' );
    
    let sum = 0;
    
    for ( let i = 0; i < cleanNumber.length; i++ ) {
      let digit = parseInt( cleanNumber[ i ], 10 );
      
      if ( i % 2 === 1 ) {
        digit *= 2;
        if ( digit > 9 ) digit -= 9;
      }
      
      sum += digit;
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
    const result = await this._modelRepository.findOrCreate( data );

    if ( result.isFailure ) return result;

    const [ creditCard ] = result.value;
    return Result.success( creditCard );
  }
}
