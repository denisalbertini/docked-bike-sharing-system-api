import Result from '../model/shared/result';
import { NOT_FOUND_ERROR, VALIDATION_ERROR } from '../error-types';
import jwt from 'jsonwebtoken';

export default class BikerFacade {
  #bikerService;
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
    this.#bikerService = bikerService;
    this.#passportService = passportService;
    this.#creditCardService = creditCardService;
    this.#transaction = transaction;
    this.#emailService = emailService;
  }

  async createBiker( bikerData, creditCardData, passportData = null ) {
    const errors = [];

    const bikerValidationResult = this.#bikerService.validate(
      { ...bikerData, ...( passportData ?? {} ) }
    );
    if ( bikerValidationResult.isFailure )
      errors.push( ...bikerValidationResult.errors );

    const creditCardValidationResult =
      this.#creditCardService.validate( creditCardData );
    if( creditCardValidationResult.isFailure )
      errors.push( ...creditCardValidationResult.errors );

    if ( errors.length !== 0 )
      return Result.failure( VALIDATION_ERROR, ...errors );

    try {
      await this.#transaction.start();

      const creditCardResult =
        await this.#creditCardService.findOrCreate( creditCardData );
      if ( creditCardResult.isFailure ) {
        await this.#transaction.rollback();
        return creditCardResult;
      }

      const creditCard = creditCardResult.value;
      const creditCardId = creditCard.id;
      bikerData.creditCardId = creditCardId;

      const bikerResult =
        await this.#bikerService.create( bikerData );
      if ( bikerResult.isFailure ) {
        await this.#transaction.rollback();
        return bikerResult;
      }

      const biker = bikerResult.value;
      const bikerId = biker.id;
      passportData.bikerId = bikerId;

      if ( passportData ) {
        const passportResult =
          await this.#passportService.create( passportData );
        if ( passportResult.isFailure ) {
          await this.#transaction.rollback();
          return passportResult;
        }

        const passport = passportResult.value;
        biker.passport = passport;
      }

      biker.creditCard = creditCard;

      const tokenPayload = { bikerId, purpose: 'email_verification' };
      const token = jwt.sign(
        tokenPayload, process.env.JWT_SECRET, { expiresIn: '15m' }
      );

      const emailResult =
        await this.#emailService.sendAccountConfirmation( bikerId, biker.email, token );
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

  async updateBiker( bikerId, data ) {
    const validationResult = this.#bikerService.validate( data );
    if ( validationResult.isFailure ) return validationResult;

    try {
      await this.#transaction.start();

      const bikerResult =
        await this.#bikerService.updateById( bikerId, data );
      if ( bikerResult.isFailure ) {
        await this.#transaction.rollback();
        return bikerResult;
      }

      const biker = bikerResult.value;

      const findPassportResult =
        await this.#passportService.findByBikerId( bikerId );
      if (
        findPassportResult.isFailure && 
        findPassportResult.errorType !== NOT_FOUND_ERROR
      ) {
        await this.#transaction.rollback();
        return findPassportResult;
      }

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
    const validationResult = this.#creditCardService.validate( data );
    if ( validationResult.isFailure ) return validationResult;

    try {
      await this.#transaction.start();

      const creditCardResult =
        await this.#creditCardService.findOrCreate( data );
      if ( creditCardResult.isFailure ) {
        await this.#transaction.rollback();
        return creditCardResult;
      }

      const creditCardId = creditCardResult.value.id;

      const bikerResult =
        await this.#bikerService.updateById( bikerId, { creditCardId } );
      if ( bikerResult.isFailure ) {
        await this.#transaction.rollback();
        return bikerResult;
      }

      await this.#transaction.commit();

      return Result.success();
    } catch ( error ) {
      await this.#transaction.rollback();

      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }

  async activateBikerAccount( bikerId ) {
    return await this.#bikerService.activateAccount( bikerId );
  }

  async login( email ) {
    return this.#bikerService.login( email );
  }
}
