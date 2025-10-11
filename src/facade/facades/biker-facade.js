import BaseFacade from '../base-facade';
import Result from '../../model/shared/result';
import { NOT_FOUND_ERROR, VALIDATION_ERROR } from '../../error-types';

export default class BikerFacade extends BaseFacade {
  #passportService;
  #creditCardService;
  #transaction;
  #emailService;

  constructor(
    bikerService, 
    passportService, 
    creditCardService, 
    transaction, 
    emailService
  ) {
    super( bikerService );
    this.#passportService = passportService;
    this.#creditCardService = creditCardService;
    this.#transaction = transaction;
    this.#emailService = emailService;
  }

  async createBiker( bikerData, creditCardData, passportData ) {
    // Validates the data
    const errors = [];

    const bikerValidationResult = this._modelService.validate(
      { ...bikerData, ...( passportData ?? {} ) }
    );
    if ( bikerValidationResult.isFailure )
      errors.push( ...bikerValidationResult.errors );

    const creditCardValidationResult = this.#creditCardService.validate(
      creditCardData
    );
    if( creditCardValidationResult.isFailure )
      errors.push( ...creditCardValidationResult.errors );

    if ( errors.length !== 0 )
      return Result.failure( VALIDATION_ERROR, ...errors );

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Finds or creates the credit card
      const creditCardResult = await this.#creditCardService.findOrCreate(
        creditCardData
      );
      if ( creditCardResult.isFailure ) {
        await this.#transaction.rollback();
        return creditCardResult;
      }

      const creditCard = creditCardResult.value;

      // Creates the biker
      const bikerResult = await this.createRecord(
        { ...bikerData, creditCardId: creditCard.id }
      );
      if ( bikerResult.isFailure ) {
        await this.#transaction.rollback();
        return bikerResult;
      }

      const biker = bikerResult.value;

      // Creates the passport
      if ( passportData ) {
        const passportResult = await this.#passportService.create(
          { ...passportData, bikerId: biker.id }
        );
        if ( passportResult.isFailure ) {
          await this.#transaction.rollback();
          return passportResult;
        }

        const passport = passportResult.value;
        biker.passport = passport;
      }

      biker.creditCard = creditCard;

      // Generates the confirmation token
      const generateTokenResult =
        await this._modelService.generateAccountConfirmationToken( biker );
      if ( generateTokenResult.isFailure ) {
        await this.#transaction.rollback();
        return generateTokenResult;
      }

      const token = generateTokenResult.value;

      // Sends the confirmation email
      const emailResult = await this.#emailService.sendAccountConfirmation(
        biker.id, biker.email, token
      );
      if ( emailResult.isFailure ) {
        await this.#transaction.rollback();
        return emailResult;
      }

      await this.#transaction.commit();

      return Result.success( biker );
    } catch ( error ) {
      await this.#transaction.rollback();

      return Result.failure( INTERNAL_SERVER_ERROR, error.message);
    }
  }

  login( data ) {
    return this._modelService.login( data );
  }

  async updateBiker( bikerId, data ) {
    // Validates the data
    const validationResult = this._modelService.validate( data );
    if ( validationResult.isFailure ) return validationResult;

    // Tries to finalize the proccess with a transaction
    try {
      await this.#transaction.start();

      // Updates the biker
      const bikerResult =
        await this.updateRecordById( bikerId, data );
      if ( bikerResult.isFailure ) {
        await this.#transaction.rollback();
        return bikerResult;
      }

      const biker = bikerResult.value;

      // Checks if the biker has a passport
      const findPassportResult =
        await this.#passportService.findByBikerId( bikerId );
      if (
        findPassportResult.isFailure && 
        findPassportResult.errorType !== NOT_FOUND_ERROR
      ) {
        await this.#transaction.rollback();
        return findPassportResult;
      }

      // Updates or creates the passport
      let passportResult;
      if ( findPassportResult.isSuccess ) {
        const passportId = findPassportResult.value.id;
        passportResult =
          await this.#passportService.updateById( passportId, data );
      } else {
        passportResult =
          await this.#passportService.create( { ...data, bikerId } );
      }

      if ( passportResult.isFailure ) {
        await this.#transaction.rollback();
        return passportResult;
      }

      biker.passport = passportResult.value;

      await this.#transaction.commit();

      return Result.success( biker );
    } catch ( error ) {
      await this.#transaction.rollback();

      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }

  async changeBikerCreditCard( bikerId, data ) {
    // Validates the data
    const validationResult = this.#creditCardService.validate( data );
    if ( validationResult.isFailure ) return validationResult;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Finds or creates the credit card
      const creditCardResult = await this.#creditCardService.findOrCreate( data );
      if ( creditCardResult.isFailure ) {
        await this.#transaction.rollback();
        return creditCardResult;
      }

      const creditCard = creditCardResult.value;

      // Updates the biker
      const bikerResult = await this.updateRecordById(
        bikerId, { creditCardId: creditCard.id }
      );
      if ( bikerResult.isFailure ) {
        await this.#transaction.rollback();
        return bikerResult;
      }

      const biker = bikerResult.value;
      biker.creditCard = creditCard;

      await this.#transaction.commit();

      return Result.success( biker );
    } catch ( error ) {
      await this.#transaction.rollback();

      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
