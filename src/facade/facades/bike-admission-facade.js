import BaseFacade from '../base-facade.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import Result from '../../model/shared/result.js';
import { INTERNAL_SERVER_ERROR } from '../../error-types.js';

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
    // Checks the bike's status
    const checkBikeStatus = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerialNumber, bikeStatus.NEW, bikeStatus.UNDER_MAINTENANCE
    );
    if ( checkBikeStatus.isFailure ) return checkBikeStatus;

    const bike = checkBikeStatus.value;

    // Checks the dock's status
    const checkDockStatus = await this.#dockService.checkStatusBySerialNumber(
      dockSerialNumber, dockStatus.AVAILABLE
    );
    if ( checkDockStatus.isFailure ) return checkDockStatus;

    const dock = checkDockStatus.value;

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

      return Result.success( bikeAdmission );
    } catch ( error ) {
      await this.#transaction.rollback();
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
