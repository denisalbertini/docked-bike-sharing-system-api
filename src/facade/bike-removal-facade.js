import bikeStatus from '../model/shared/enum/bike-status.js';
import dockStatus from '../model/shared/enum/dock-status.js';
import Result from '../model/shared/result.js';
import {
  INTERNAL_SERVER_ERROR, 
  VALIDATION_ERROR
} from '../error-types.js';

export default class BikeRemovalFacade {
  #bikeRemovalService;
  #bikeService;
  #dockService;
  #transaction;

  constructor(
    bikeRemovalService, 
    bikeService, 
    dockService, 
    transaction
  ) {
    this.#bikeRemovalService = bikeRemovalService;
    this.#bikeService = bikeService;
    this.#dockService = dockService;
    this.#transaction = transaction;
  }

  async createBikeRemoval(
    { employeeId, bikeSerialNumber, dockSerialNumber, action }
  ) {
    // Checks the bike's status
    const checkBikeStatus = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerialNumber, bikeStatus.MAINTENANCE_REQUESTED
    );
    if ( checkBikeStatus.isFailure ) return checkBikeStatus;

    const bike = checkBikeStatus.value;

    // Checks the dock's status
    const checkDockStatus = await this.#dockService.checkStatusBySerialNumber(
      dockSerialNumber, dockStatus.OCCUPIED
    );
    if ( checkDockStatus.isFailure ) return checkDockStatus;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the removal record
      const createBikeRemovalResult = await this.#bikeRemovalService.create(
        { employeeId, bikeId: bike.id }
      );
      if ( createBikeRemovalResult.isFailure ) {
        await this.#transaction.rollback();
        return createBikeRemovalResult;
      }

      const bikeAdmission = createBikeRemovalResult.value;

      // Gets the new bike status
      const bikeStatusResult = this.#bikeService.getStatusByAction( action );
      if ( bikeStatusResult.isFailure ) {
        await this.#transaction.rollback();
        return bikeStatusResult;
      }

      const newBikeStatus = bikeStatusResult.value;
      
      // Updates the bike's status
      const updateBikeResult = await this.#bikeService.updateStatusById(
        bike.id, newBikeStatus
      );
      if ( updateBikeResult.isFailure ) {
        await this.#transaction.rollback();
        return updateBikeResult;
      }

      // Updates the dock's status
      const updateDockResult = await this.#dockService.updateStatusById(
        dock.id, dockStatus.AVAILABLE
      );
      if ( updateDockResult.isFailure ) {
        await this.#transaction.rollback();
        return updateDockResult;
      }

      await this.#transaction.commit();

      return Result.success( bikeAdmission );
    } catch ( error ) {
      await this.#transaction.rollback();
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
