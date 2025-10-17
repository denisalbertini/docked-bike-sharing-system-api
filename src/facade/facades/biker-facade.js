import { BaseError } from 'sequelize';
import { INTERNAL_SERVER_ERROR } from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseFacade from '../base-facade.js';

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

  async createBiker( bikerData, creditCardData, passportData = null ) {
    // Validates the data
    const failures = [];

    const bikerValidationResult = this._modelService.validate(
      { ...bikerData, ...( passportData ?? {} ) }
    );
    if ( bikerValidationResult.isFailure )
      failures.push( bikerValidationResult );

    const creditCardValidationResult = this.#creditCardService.validate(
      creditCardData
    );
    if( creditCardValidationResult.isFailure )
      failures.push( creditCardValidationResult );

    // Checks for failures
    if ( failures.length !== 0 ) return Result.mergeFailures( failures );

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Finds or creates the credit card
      const creditCardResult = await this.#creditCardService.findOrCreate(
        {
          creditCardNumber: creditCardData.creditCardNumber, 
          holderName: creditCardData.holderName, 
          expirationDate: creditCardData.expirationDate, 
        }
      );
      if ( creditCardResult.isFailure ) failures.push( creditCardResult );
      const creditCard = creditCardResult.value ?? {};

      // Creates the biker
      const bikerResult = await this.createRecord(
        { ...bikerData, creditCardId: creditCard.id }
      );
      if ( bikerResult.isFailure ) failures.push( bikerResult );
      const biker = bikerResult.value ?? {};

      // Creates the passport
      if ( passportData ) {
        const passportResult = await this.#passportService.create(
          { ...passportData, bikerId: biker.id }
        );
        if ( passportResult.isFailure ) failures.push( passportResult );
        var passport = passportResult.value;
      }

      // Checks for failures
      if ( failures.length !== 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

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

      const successData = {
        ...( biker.cpf && { cpf: biker.cpf } ), 
        name: biker.name, 
        birthDate: biker.birthDate, 
        email: biker.email, 
        foreigner: biker.foreigner, 
        status: biker.status, 
        ...( passport && {
            passport: {
              passportNumber: passport.passportNumber, 
              expirationDate: passport.expirationDate, 
              countryCode: passport.countryCode
            }
          }
        )
      };

      await this.#transaction.commit();

      return Result.success( successData );
    } catch ( error ) {
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }
  }

  async updateBiker( bikerId, bikerData, passportData = null ) {
    // Validates the data
    const dataValidationResult = this._modelService.validate(
      { ...bikerData, ...( passportData ?? {} ), update: true }
    );
    if ( dataValidationResult.isFailure ) return dataValidationResult;

    // Tries to finalize the proccess with a transaction
    try {
      const failures = [];
      
      await this.#transaction.start();

      // Updates the biker
      const bikerUpdateResult = await this.updateRecordById( bikerId, bikerData );
      if ( bikerUpdateResult.isFailure ) failures.push( bikerUpdateResult );

      // Updates the passport
      if ( passportData ) {
        var passportUpdateResult = await this.#passportService.updateByBikerId(
          bikerId, passportData
        );
        if ( passportUpdateResult.isFailure ) failures.push( passportUpdateResult );
        else var passport = passportUpdateResult.value;
      }

      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      const biker = bikerUpdateResult.value;

      const successData = {
        ...( biker.cpf && { cpf: biker.cpf } ), 
        name: biker.name, 
        birthDate: biker.birthDate, 
        email: biker.email, 
        foreigner: biker.foreigner, 
        status: biker.status, 
        ...( passport && {
            passport: {
              passportNumber: passport.passportNumber, 
              expirationDate: passport.expirationDate, 
              countryCode: passport.countryCode
            }
          }
        )
      };

      await this.#transaction.commit();

      return Result.success( successData );
    } catch ( error ) {
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }
  }

  confirmEmail( bikerId, token ) {
    return this._modelService.activateAccount( bikerId, token );
  }

  async changeBikerCreditCard( bikerId, creditCardData ) {
    // Validates the data
    const validationResult = this.#creditCardService.validate( creditCardData );
    if ( validationResult.isFailure ) return validationResult;

    // Tries to finalize the process with a transaction
    try {
      const failures = [];
      
      await this.#transaction.start();

      // Finds or creates the credit card
      const creditCardResult = await this.#creditCardService.findOrCreate(
        {
          creditCardNumber: creditCardData.creditCardNumber, 
          holderName: creditCardData.holderName, 
          expirationDate: creditCardData.expirationDate
        }
      );
      if ( creditCardResult.isFailure ) failures.push( creditCardResult );

      const creditCard = creditCardResult.value ?? {};

      // Updates the biker
      const bikerResult = await this.updateRecordById(
        bikerId, { creditCardId: creditCard.id }
      );
      if ( bikerResult.isFailure ) failures.push( bikerResult );

      // Checks for failures
      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      await this.#transaction.commit();

      return Result.success();
    } catch ( error ) {
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }
  }

  login( data ) {
    return this._modelService.login( data );
  }
}
