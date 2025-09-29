import Result from '../../model/shared/result.js';
import { VALIDATION_ERROR } from '../../error-types.js';

export default class BikerService {
  #creditCardRepository;
  #passportRepository;
  #transaction;

  constructor(
    bikerRepository, 
    creditCardRepository, 
    passportRepository, 
    transaction
  ) {
    super( bikerRepository );
    this.#creditCardRepository = creditCardRepository;
    this.#passportRepository = passportRepository;
    this.#transaction = transaction;
  }

  validateCreationData(
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

    if ( password !== confirmationPassword )
      errors.push( 'Passwords must match.' );

    if ( errors.length > 0 )
      return Result.failure( errors, VALIDATION_ERROR );

    return Result.success();
  }

  createLocal( bikerData, creditCardData ) {}

  createForeigner( bikerData, creditCardData, passportData ) {}
}
