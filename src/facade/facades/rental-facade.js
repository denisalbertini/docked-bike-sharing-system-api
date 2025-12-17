import { BaseError } from 'sequelize';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import {
    BAD_REQUEST_ERROR,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseFacade from '../base-facade.js';

export default class RentalFacade extends BaseFacade {
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
    super( rentalService );
    this.#bikerService = bikerService;
    this.#bikeService = bikeService;
    this.#dockService = dockService;
    this.#chargeService = chargeService;
    this.#ccAdminService = ccAdmService;
    this.#stationService = stationService;
    this.#emailService = emailService;
    this.#transaction = transaction;
  }

  async createRental( { bikerId, bikeSerial, dockSerial } ) {
    const failures = [];
    
    // Verifies if the biker is already renting
    const bikerRentingResult =
      await this._modelService.findUnfinishedByBikerId( bikerId );
    if ( bikerRentingResult.isSuccess ) failures.push(
      Result.failure( BAD_REQUEST_ERROR, 'Biker is already renting.' )
    );
    else if ( bikerRentingResult.errorType !== NOT_FOUND_ERROR )
      failures.push( bikerRentingResult );

    // Verifies if the dock is occupied
    const dockOccupiedResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerial, dockStatus.OCCUPIED
    );
    if ( dockOccupiedResult.isFailure ) failures.push( dockOccupiedResult );

    // Verifies if the bike is available
    const bikeAvailableResult = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerial, bikeStatus.AVAILABLE
    );
    if ( bikeAvailableResult.isFailure ) failures.push( bikeAvailableResult );

    // Checks for failures
    if ( failures.length > 0 ) return Result.mergeFailures( failures );

    const dock = dockOccupiedResult.value;
    const bike = bikeAvailableResult.value;

    // Tries to finalize the process in a transaction
    try {
      const transaction = await this.#transaction.start();

      // Creates the charge
      var initialChargeAmount = 10;
      const createChargeResult = await this.#chargeService.create(
        { amount: initialChargeAmount, bikerId }, transaction
      );
      if ( createChargeResult.isFailure ) failures.push( createChargeResult );

      const charge = createChargeResult.value ?? {};

      // Process the payment
      const chargeAttemptResult = this.#ccAdminService.processPayment( charge );
      if ( chargeAttemptResult.isFailure ) failures.push( chargeAttemptResult );

      // Updates the charge
      const completeChargeResult = await this.#chargeService.complete(
        charge, transaction
      );
      if ( completeChargeResult.isFailure ) failures.push( completeChargeResult );

      // Creates the rental
      const createRentalResult = await this.createRecord(
        {
          bikerId, 
          bikeId: bike.id, 
          rentedFromDockId: dock.id, 
          initialChargeId: charge.id
        }, 
        transaction
      );
      if ( createRentalResult.isFailure ) failures.push( createRentalResult );

      var rental = createRentalResult.value ?? {};

      // Updates the bike's status
      const updateBikeResult =
        await this.#bikeService.updateStatusById(
          bike.id, bikeStatus.RENTED, transaction
        );
      if ( updateBikeResult.isFailure ) failures.push( updateBikeResult );

      // Updates the dock's status
      const updateDockResult =
        await this.#dockService.updateStatusById(
          dock.id, dockStatus.AVAILABLE, transaction
        );
      if ( updateDockResult.isFailure ) failures.push( updateDockResult );

      // Checks for failures
      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      var successData = {
        ...rental.toJSON(), 
        startedAt: rental.startedAt.toISOString()
      };

      await this.#transaction.commit();
    } catch ( error ) {
      await this.#transaction.rollback();
      
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }

    const rentalResult = Result.success( successData );

    // Tries to send an email with the rental's info
    const findStationResult = await this.#stationService.findById(
      dock.stationId
    );
    const findBikerResult = await this.#bikerService.findById(
      bikerId
    );
    if ( findStationResult.isFailure || findBikerResult.isFailure )
      return rentalResult;

    const station = findStationResult.value;
    const biker = findBikerResult.value;

    const rentalInfo = {
      station: station.name, 
      time: rental.startedAt.toString(), 
      chargeAmount: initialChargeAmount
    };
    
    await this.#emailService.sendRentalConfirmation( biker.email, rentalInfo );

    return rentalResult;
  }

  async registerReturn( { bikeSerial, dockSerial } ) {
    const failures = [];
    
    // Verifies if the bike is rented
    const bikeRentedResult = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerial, bikeStatus.RENTED
    );
    if ( bikeRentedResult.isFailure ) failures.push( bikeRentedResult );
    
    // Verifies if the dock is available
    const dockAvailableResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerial, dockStatus.AVAILABLE
    );
    if ( dockAvailableResult.isFailure ) failures.push( dockAvailableResult );

    // Checks for failures
    if ( failures.length > 0 ) return Result.mergeFailures( failures );
    
    const dock = dockAvailableResult.value;
    const bike = bikeRentedResult.value;

    // Finds the rental
    const findRentalResult = await this._modelService.findUnfinishedByBikeId(
      bike.id
    );
    if ( findRentalResult.isFailure ) return findRentalResult;

    const rental = findRentalResult.value;

    // Calculates additional charge amount
    const additionalChargeResult = this.#chargeService.calculateAdditionalAmount(
      rental.startedAt, Date.now()
    );
    if ( additionalChargeResult.isFailure ) return additionalChargeResult;

    const additionalChargeAmount = additionalChargeResult.value;

    // Tries to finalize the process with a transaction
    try {
      const transaction = await this.#transaction.start();

      // Process the additional charge
      if ( additionalChargeAmount > 0 ) {
        const createChargeResult = await this.#chargeService.create(
          { amount: additionalChargeAmount, bikerId: rental.bikerId }, 
          transaction
        );
        if ( createChargeResult.isFailure ) failures.push( createChargeResult );

        var charge = createChargeResult.value ?? {};

        // Process the charge
        const paymentResult = this.#ccAdminService.processPayment( charge );

        // Updates the charge
        if ( paymentResult.isSuccess ) {
          const completeChargeResult = await this.#chargeService.complete(
            charge, transaction
          );
          if ( completeChargeResult.isFailure ) failures.push( completeChargeResult );
        }
      }

      // Updates the rental info
      const updateRentalResult = await this._modelService.updateById(
        rental.id, 
        {
          finishedAt: Date.now(), 
          returnedToDockId: dock.id, 
          extraChargeId: charge ? charge.id : null
        }, 
        transaction
      );
      if ( updateRentalResult.isFailure ) failures.push( updateRentalResult );

      // Updates the bike's status
      const updateBikeResult = await this.#bikeService.updateStatusById(
        bike.id, bikeStatus.AVAILABLE, transaction
      );
      if ( updateBikeResult.isFailure ) failures.push( updateBikeResult );

      // Updates the dock's status
      const updateDockResult = await this.#dockService.updateStatusById(
        dock.id, dockStatus.OCCUPIED, transaction
      );
      if ( updateDockResult.isFailure ) failures.push( updateDockResult );

      // Checks for failures
      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      var updatedRental = updateRentalResult.value;

      var successData = {
        ...updatedRental.toJSON(), 
        startedAt: updatedRental.startedAt.toISOString(), 
        finishedAt: updatedRental.finishedAt.toISOString()
      };

      await this.#transaction.commit();
    } catch ( error ) {
      await this.#transaction.rollback();
      
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }

    const rentalResult = Result.success( successData );

    // Tries to send an email with the rental's info
    const findStationResult = await this.#stationService.findById(
      dock.stationId
    );
    const findBikerResult = await this.#bikerService.findById(
      rental.bikerId
    );
    if ( findStationResult.isFailure || findBikerResult.isFailure )
      return rentalResult;

    const station = findStationResult.value;
    const biker = findBikerResult.value;

    const rentalInfo = {
      station: station.name, 
      time: updatedRental.finishedAt.toString(), 
      chargeAmount: additionalChargeAmount
    };
    
    await this.#emailService.sendRentalConfirmation(
      biker.email, rentalInfo, true
    );

    return rentalResult;
  }
}
