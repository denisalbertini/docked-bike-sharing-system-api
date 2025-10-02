import Result from '../../model/shared/result.js';
import {
  VALIDATION_ERROR, 
  INTERNAL_SERVER_ERROR
} from '../../error-types.js';

export default class BikerService {
  #bikerRepository;
  #creditCardRepository;
  #passportRepository;
  #transaction;

  constructor(
    bikerRepository, 
    creditCardRepository, 
    passportRepository, 
    transaction
  ) {
    this.#bikerRepository = bikerRepository;
    this.#creditCardRepository = creditCardRepository;
    this.#passportRepository = passportRepository;
    this.#transaction = transaction;
  }

  validateData(
    {
      foreigner, 
      cpf, 
      passportNumber, 
      countryCode, 
      password, 
      confirmationPassword = null
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

  async create( bikerData, creditCardData, passportData = null ) {
    try {
      await this.#transaction.start();

      const creditCardResult =
        await this.#creditCardRepository.create( creditCardData );
      if ( creditCardResult.isFailure ) {
        await this.#transaction.rollback();
        return creditCardResult;
      }

      const creditCard = creditCardResult.value;
      const creditCardId = creditCard.id;
      bikerData.creditCardId = creditCardId;

      const bikerResult =
        await this.#bikerRepository.create( bikerData );
      if ( bikerResult.isFailure ) {
        await this.#transaction.rollback();
        return bikerResult;
      }

      const biker = bikerResult.value;
      biker.creditCard = creditCard;

      if ( passportData ) {
        const passportResult =
          await this.#passportRepository.create( passportData );
        if ( passportResult.isFailure ) {
          await this.#transaction.rollback();
          return passportResult;
        }

        const passport = passportResult.value;
        biker.passport = passport;
      }

      await this.#transaction.commit();

      return Result.success( biker );
    } catch ( error ) {
      await this.#transaction.rollback();

      return Result.failure(
        error.message, 
        INTERNAL_SERVER_ERROR
      );
    }
  }

  async update( bikerId, bikerData, passportData ) {
    try {
      await this.#transaction.start();

      const bikerResult =
        await this.#bikerRepository.updateById( bikerId, bikerData );
      if ( bikerResult.isFailure ) {
        await this.#transaction.rollback();
        return bikerResult;
      }

      const biker = bikerResult.value;

      const findPassportResult =
        await this.#passportRepository.findByBikerId( bikerId );
      if ( findPassportResult.isFailure ) {
        await this.#transaction.rollback();
        return findPassportResult;
      }

      const passportId = findPassportResult.value.id;

      const updatePassportResult =
        await this.#passportRepository.updateById( passportId, passportData );
      if ( updatePassportResult.isFailure ) {
        await this.#transaction.rollback();
        return updatePassportResult;
      }

      const updatedPassport = updatePassportResult.value;
      biker.passport = updatedPassport;

      await this.#transaction.commit();

      return Result.success( biker );
    } catch ( error ) {
      await this.#transaction.rollback();

      return Result.failure(
        error.message, 
        INTERNAL_SERVER_ERROR
      );
    }
  }
}
