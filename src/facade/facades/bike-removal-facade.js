import BaseFacade from '../base-facade.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import Result from '../../model/shared/result.js';
import {
  INTERNAL_SERVER_ERROR, 
  VALIDATION_ERROR
} from '../../model/shared/enum/error-types.js';

export default class BikeRemovalFacade extends BaseFacade {
  #bikeService;
  #dockService;
  #transaction;

  constructor(
    bikeRemovalService, 
    bikeService, 
    dockService, 
    transaction
  ) {
    super( bikeRemovalService );
    this.#bikeService = bikeService;
    this.#dockService = dockService;
    this.#transaction = transaction;
  }

  async createBikeRemoval(
    { employeeId, bikeSerialNumber, dockSerialNumber, action }
  ) {
    const errors = [];
        
    // Checks the bike's status
    const bikeStatusResult = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerialNumber, bikeStatus.MAINTENANCE_REQUESTED
    );
    if ( bikeStatusResult.isFailure ) errors.push( ...bikeStatusResult.errors );

    // Checks the dock's status
    const dockStatusResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerialNumber, dockStatus.OCCUPIED
    );
    if ( dockStatusResult.isFailure ) errors.push( ...dockStatusResult.errors );

    if ( errors.length > 0 ) return Result.failure(
      bikeStatusResult.errorType === dockStatusResult.errorType ? 
      bikeStatusResult.errorType : 
      VALIDATION_ERROR, 
      ...errors
    );

    const bike = bikeStatusResult.value;
    const dock = dockStatusResult.value;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the removal record
      const createBikeRemovalResult = await this.createRecord(
        { employeeId, bikeId: bike.id }
      );
      if ( createBikeRemovalResult.isFailure ) {
        await this.#transaction.rollback();
        return createBikeRemovalResult;
      }

      const bikeRemoval = createBikeRemovalResult.value;

      // Gets the new bike status
      const newBikeStatusResult = this.#bikeService.getStatusByAction( action );
      if ( newBikeStatusResult.isFailure ) {
        await this.#transaction.rollback();
        return newBikeStatusResult;
      }

      const newBikeStatus = newBikeStatusResult.value;
      
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

      return Result.success(
        {
          id: bikeRemoval.id, 
          requestedAt: bikeRemoval.requestedAt.toString(), 
          bikeId: bikeRemoval.bikeId, 
          employeeId: bikeRemoval.employeeId
        }
      );
    } catch ( error ) {
      await this.#transaction.rollback();
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
