import BaseFacade from '../base-facade.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import Result from '../../model/shared/result.js';
import {
  INTERNAL_SERVER_ERROR, 
  VALIDATION_ERROR
} from '../../model/shared/enum/error-types.js';

export default class BikeAdmissionFacade extends BaseFacade {
  #bikeService;
  #dockService;
  #transaction;

  constructor(
    bikeAdmissionService, 
    bikeService, 
    dockService, 
    transaction
  ) {
    super( bikeAdmissionService );
    this.#bikeService = bikeService;
    this.#dockService = dockService;
    this.#transaction = transaction;
  }

  async createBikeAdmission( { bikeSerialNumber, dockSerialNumber } ) {
    const errors = [];
    
    // Checks the bike's status
    const bikeStatusResult = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerialNumber, bikeStatus.NEW, bikeStatus.UNDER_MAINTENANCE
    );
    if ( bikeStatusResult.isFailure ) errors.push( ...bikeStatusResult.errors );

    // Checks the dock's status
    const dockStatusResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerialNumber, dockStatus.AVAILABLE
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

      // Creates the admission record
      const createBikeAdmissionResult = await this.createRecord(
        { bikeId: bike.id, dockId: dock.id }
      );
      if ( createBikeAdmissionResult.isFailure ) {
        await this.#transaction.rollback();
        return createBikeAdmissionResult;
      }

      const bikeAdmission = createBikeAdmissionResult.value;

      // Updates the bike's status
      const updateBikeResult = await this.#bikeService.updateStatusById(
        bike.id, bikeStatus.AVAILABLE
      );
      if ( updateBikeResult.isFailure ) {
        await this.#transaction.rollback();
        return updateBikeResult;
      }

      // Updates the dock's status
      const updateDockResult = await this.#dockService.updateStatusById(
        dock.id, dockStatus.OCCUPIED
      );
      if ( updateDockResult.isFailure ) {
        await this.#transaction.rollback();
        return updateDockResult;
      }

      await this.#transaction.commit();

      return Result.success(
        {
          id: bikeAdmission.id, 
          requestedAt: bikeAdmission.requestedAt.toString(), 
          bikeId: bikeAdmission.bikeId, 
          dockId: bikeAdmission.dockId
        }
      );
    } catch ( error ) {
      await this.#transaction.rollback();
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
