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

    const bikerValidationResult = this._modelService.validateBeforeCreate(
      bikerData, passportData
    );
    if ( bikerValidationResult.isFailure ) failures.push( bikerValidationResult );

    const creditCardValidationResult = this.#creditCardService.validate(
      creditCardData
    );
    if( creditCardValidationResult.isFailure ) failures.push(
      creditCardValidationResult
    );

    // Checks for failures
    if ( failures.length !== 0 ) return Result.mergeFailures( failures );

    // Tries to finalize the process with a transaction
    try {
      const transaction = await this.#transaction.start();

      // Finds or creates the credit card
      const creditCardResult = await this.#creditCardService.findOrCreate(
        {
          creditCardNumber: creditCardData.creditCardNumber, 
          holderName: creditCardData.holderName, 
          creditCardExpirationDate: creditCardData.creditCardExpirationDate
        }, 
        transaction
      );
      if ( creditCardResult.isFailure ) failures.push( creditCardResult );
      const creditCard = creditCardResult.value ?? {};

      // Creates the biker
      const bikerResult = await this.createRecord(
        { ...bikerData, creditCardId: creditCard.id }, transaction
      );
      if ( bikerResult.isFailure ) failures.push( bikerResult );
      const biker = bikerResult.value ?? {};

      // Creates the passport
      if ( passportData ) {
        const passportResult = await this.#passportService.create(
          { ...passportData, bikerId: biker.id }, transaction
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
        creditCard: creditCard.toJSON(), 
        biker: biker.toJSON(), 
        ...( passport && { passport: passport.toJSON() } )
      };

      await this.#transaction.commit();

      return Result.success( successData );
    } catch ( error ) {
      await this.#transaction.rollback();
      
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }
  }

  confirmEmail( bikerId, token ) {
    return this._modelService.activateAccount( bikerId, token );
  }

  login( { email, password } ) {
    return this._modelService.login( email, password );
  }

  async updateBiker( bikerId, bikerData, passportData = null ) {
    // Validates the data
    const dataValidationResult = await this._modelService.validateBeforeUpdate(
      bikerId, bikerData, passportData
    );
    if ( dataValidationResult.isFailure ) return dataValidationResult;

    // Tries to finalize the proccess with a transaction
    try {
      const failures = [];
      
      const transaction = await this.#transaction.start();

      // Updates the biker
      const bikerUpdateResult = await this.updateRecordById(
        bikerId, bikerData, transaction
      );
      if ( bikerUpdateResult.isFailure ) failures.push( bikerUpdateResult );

      // Updates the passport
      if ( passportData ) {
        const passportUpdateResult = await this.#passportService.updateByBikerId(
          bikerId, passportData, transaction
        );
        if ( passportUpdateResult.isFailure ) failures.push( passportUpdateResult );
        var passport = passportUpdateResult.value;
      }

      // Checks for failures
      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      const biker = bikerUpdateResult.value;

      const successData = {
        biker: biker.toJSON(), 
        ...( passport && { passport: passport.toJSON() } )
      };

      await this.#transaction.commit();

      return Result.success( successData );
    } catch ( error ) {
      await this.#transaction.rollback();
      
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }
  }

  async changeCreditCard( bikerId, creditCardData ) {
    // Validates the data
    const validationResult = this.#creditCardService.validate( creditCardData );
    if ( validationResult.isFailure ) return validationResult;

    // Tries to finalize the process with a transaction
    try {
      const failures = [];
      
      const transaction = await this.#transaction.start();

      // Finds or creates the credit card
      const creditCardResult = await this.#creditCardService.findOrCreate(
        {
          creditCardNumber: creditCardData.creditCardNumber, 
          holderName: creditCardData.holderName, 
          creditCardExpirationDate: creditCardData.creditCardExpirationDate
        }, 
        transaction
      );
      if ( creditCardResult.isFailure ) failures.push( creditCardResult );

      const creditCard = creditCardResult.value ?? {};

      // Updates the biker
      const bikerResult = await this.updateRecordById(
        bikerId, { creditCardId: creditCard.id }, transaction
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
      await this.#transaction.rollback();
      
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }
  }
}
