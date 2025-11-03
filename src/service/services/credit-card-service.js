import { VALIDATION_ERROR } from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseService from '../base-service.js';

export default class CreditCardService extends BaseService {
  constructor( creditCardRepository ) { super( creditCardRepository ); }
  
  validate( { creditCardNumber, creditCardExpirationDate, cvv } ) {
    const errors = [];

    if ( !this.#validateNumber( creditCardNumber ) )
      errors.push( 'Invalid credit card number.' );
    if ( !this.#validateExpirationDate( creditCardExpirationDate ) )
      errors.push( 'Invalid credit card expiration date.' );
    if ( !this.#validateCvv( cvv ) )
      errors.push( 'Invalid credit card cvv.' );

    if ( errors.length !== 0 )
      return Result.failure( VALIDATION_ERROR, ...errors );

    return Result.success();
  }

  #validateNumber( creditCardNumber ) {
    // Remove non-digit characters
    const digits = creditCardNumber.replace( /\D/g, '' );
    
    // Check if the input contains at least one digit
    if ( digits.length === 0 ) return false;
    
    let sum = 0;
    let isEvenPosition = false;

    // Process digits from right to left
    for ( let i = digits.length - 1; i >= 0; i-- ) {
      let digit = parseInt( digits[ i ], 10 );

      // Double every second digit from the right
      if ( isEvenPosition ) {
          digit *= 2;
          // Subtract 9 if result is greater than 9
          if ( digit > 9 ) {
              digit -= 9;
          }
      }

      sum += digit;
      isEvenPosition = !isEvenPosition;
    }

    // Valid if sum is divisible by 10
    return sum % 10 === 0;
  }

  #validateExpirationDate( expirationDate ) {
    if ( !/^(0[1-9]|1[0-2])\/\d{2}$/.test( expirationDate ) ) return false;
    
    const [ monthStr, yearStr ] = expirationDate.split( '/' );
    const month = parseInt( monthStr, 10 );
    const year = parseInt( yearStr, 10 );

    const fullYear = 2000 + year;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if ( month < 1 || month > 12 ) return false;
    if ( fullYear < currentYear ) return false;
    if ( fullYear === currentYear && month < currentMonth ) return false;

    return true;
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
