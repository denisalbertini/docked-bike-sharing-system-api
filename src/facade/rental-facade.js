import Result from '../model/shared/result';
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR, 
  PRECONDITION_FAILED_ERROR
} from '../error-types';
import dockStatus from '../model/shared/enum/dock-status.js';
import bikeStatus from '../model/shared/enum/bike-status.js';

export default class RentalFacade {
  #rentalService;
  #bikerService;
  #bikeService;
  #dockService;
  #chargeService;
  #ccAdminService;
  #stationService;
  #emailService;
  #transaction;

  constructor(
    rentalService, 
    bikerService, 
    bikeService, 
    dockService, 
    chargeService, 
    ccAdmService, 
    stationService, 
    emailService, 
    transaction
  ) {
    this.#rentalService = rentalService;
    this.#bikerService = bikerService;
    this.#bikeService = bikeService;
    this.#dockService = dockService;
    this.#chargeService = chargeService;
    this.#ccAdminService = ccAdmService;
    this.#stationService = stationService;
    this.#emailService = emailService;
    this.#transaction = transaction;
  }

  async createRental( { bikerId, dockSerialNumber } ) {
    // Verifies if the biker is already renting
    const bikerRentingResult =
      await this.#rentalService.findUnfinishedByBikerId( bikerId );
    if ( bikerRentingResult.isSuccess )
      return Result.failure(
        PRECONDITION_FAILED_ERROR, 
        'Biker is already renting.'
      );
    else if ( bikerRentingResult.errorType !== NOT_FOUND_ERROR )
      return bikerRentingResult;

    // Verifies if the dock is holding a bike
    const dockOccupiedResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerialNumber, dockStatus.OCCUPIED
    );
    if ( dockOccupiedResult.isFailure ) return dockOccupiedResult;

    const dock = dockOccupiedResult.value;

    // Verifies if the bike is available
    const bikeAvailableResult = await this.#bikeService.checkStatusById(
      dock.bikeId, bikeStatus.AVAILABLE
    );
    if ( bikeAvailableResult.isFailure ) return bikeAvailableResult;

    const bike = bikeAvailableResult.value;

    // Tries to finalize the process in a transaction
    const initialChargeAmount = 10;
    let rental;

    try {
      await this.#transaction.start();

      // Creates the charge
      const createChargeResult = await this.#chargeService.create(
        { amount: initialChargeAmount, bikerId }
      );
      if ( createChargeResult.isFailure ) {
        await this.#transaction.rollback();
        return createChargeResult;
      }

      const charge = createChargeResult.value;

      // Process the payment
      const chargeAttemptResult =
        this.#ccAdminService.processPayment( charge );
      if ( chargeAttemptResult.isFailure ) {
        await this.#transaction.rollback();
        return chargeAttemptResult;
      }

      // Updates the charge
      const completeChargeResult =
        await this.#chargeService.complete( charge );
      if ( completeChargeResult.isFailure ) {
        await this.#transaction.rollback();
        return completeChargeResult;
      }

      // Creates the rental
      const createRentalResult = await this.#rentalService.create(
        {
          bikerId, 
          bikeId: bike.id, 
          rentedFromdockId: dock.id, 
          initialChargeId: charge.id
        }
      );
      if ( createRentalResult.isFailure ) {
        await this.#transaction.rollback();
        return createRentalResult;
      }

      rental = createRentalResult.value;

      // Updates the bike's status
      const updateBikeResult =
        await this.#bikeService.updateStatusById( bike.id, bikeStatus.RENTED );
      if ( updateBikeResult.isFailure ) {
        await this.#transaction.rollback();
        return updateBikeResult;
      }

      // Updates the dock's status
      const updateDockResult =
        await this.#dockService.updateStatusById( dock.id, dockStatus.AVAILABLE );
      if ( updateDockResult.isFailure ) {
        await this.#transaction.rollback();
        return updateDockResult;
      }

      await this.#transaction.commit();
    } catch ( error ) {
      await this.#transaction.rollback();
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }

    const rentalResult = Result.success( rental );

    // Tries to send an email with the rental's info
    const findStationResult =
      await this.#stationService.findById( dock.stationId );
    const findBikerResult =
      await this.#bikerService.findById( bikerId );
    if (
      findStationResult.isFailure || 
      findBikerResult.isFailure
    ) return rentalResult;

    const station = findStationResult.value;
    const biker = findBikerResult.value;
    const rentalInfo = {
      station: station.name, 
      time: rental.startedAt, 
      chargeAmount: initialChargeAmount
    };
    
    await this.#emailService.sendRentalConfirmation( biker.email, rentalInfo );

    return rentalResult;
  }

  async registerReturn( { dockSerialNumber, bikeSerialNumber } ) {
    // Verifies if the dock is available
    const dockAvailableResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerialNumber, dockStatus.AVAILABLE
    );
    if ( dockAvailableResult.isFailure ) return dockAvailableResult;

    const dock = dockAvailableResult.value;

    // Verifies if the bike is rented
    const bikeRentedResult = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerialNumber, bikeStatus.RENTED
    );
    if ( bikeRentedResult.isFailure ) return bikeRentedResult;

    const bike = bikeRentedResult.value;

    // Finds the rental
    const findRentalResult =
      await this.#rentalService.findUnfinishedByBikeId( bike.id );
    if ( findRentalResult.isFailure ) return findRentalResult;

    const rental = findRentalResult.value;

    // Calculates additional charge amount
    const additionalChargeAmount =
      this.#chargeService.calculateAdditionalAmount( rental.startedAt, Date.now() );

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the additional charge
      let charge;
      if ( additionalChargeAmount > 0 ) {
        const createChargeResult = await this.#chargeService.create(
          { amount: additionalChargeAmount, bikerId: rental.bikerId }
        );
        if ( createChargeResult.isFailure ) {
          await this.#transaction.rollback();
          return createChargeResult;
        }

        charge = createChargeResult.value;

        // Process the charge
        const chargeAttemptResult =
          this.#ccAdminService.processPayment( charge );
        if ( chargeAttemptResult.isFailure ) {
          await this.#transaction.rollback();
          return chargeAttemptResult;
        }
      }

      // Updates the rental info
      const updateRentalResult = await this.#rentalService.finishById(
        rental.id, 
        {
          finishedAt: Date.now(), 
          returnedToDockId: dock.id, 
          extraChargeId: charge ? charge.id : null
        }
      );
      if ( updateRentalResult.isFailure ) {
        await this.#transaction.rollback();
        return updateRentalResult;
      }

      // Updates the bike's status
      const updateBikeResult =
        await this.#bikeService.updateStatusById( bike.id, bikeStatus.AVAILABLE );
      if ( updateBikeResult.isFailure ) {
        await this.#transaction.rollback();
        return updateBikeResult;
      }

      // Updates the dock's status
      const updateDockResult =
        await this.#dockService.updateStatusById( dock.id, dockStatus.OCCUPIED );
      if ( updateDockResult.isFailure ) {
        await this.#transaction.rollback();
        return updateDockResult;
      }

      await this.#transaction.commit();
    } catch ( error ) {
      await this.#transaction.rollback();
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }

    const rentalResult = Result.success( rental );

    // Tries to send an email with the rental's info
    const findStationResult =
      await this.#stationService.findById( dock.stationId );
    const findBikerResult =
      await this.#bikerService.findById( rental.bikerId );
    if (
      findStationResult.isFailure || 
      findBikerResult.isFailure
    ) return rentalResult;

    const station = findStationResult.value;
    const biker = findBikerResult.value;
    const rentalInfo = {
      station: station.name, 
      time: rental.finishedAt, 
      chargeAmount: additionalChargeAmount
    };
    
    await this.#emailService.sendRentalConfirmation(
      biker.email, rentalInfo, true
    );

    return rentalResult;
  }
}
