import { BaseError } from 'sequelize';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import {
  INTERNAL_SERVER_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseFacade from '../base-facade.js';

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

  async createBikeAdmission( { bikeSerial, dockSerial } ) {
    const failures = [];
    
    // Checks the bike's status
    const bikeStatusResult = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerial, bikeStatus.NEW, bikeStatus.UNDER_MAINTENANCE
    );
    if ( bikeStatusResult.isFailure ) failures.push( bikeStatusResult );

    // Checks the dock's status
    const dockStatusResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerial, dockStatus.AVAILABLE
    );
    if ( dockStatusResult.isFailure ) failures.push( dockStatusResult );

    // Checks for failures
    if ( failures.length > 0 ) return Result.mergeFailures( failures );

    const bike = bikeStatusResult.value;
    const dock = dockStatusResult.value;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the admission record
      const createAdmissionResult = await this.createRecord(
        { bikeId: bike.id, dockId: dock.id }
      );
      if ( createAdmissionResult.isFailure ) failures.push( createAdmissionResult );

      // Updates the bike's status
      const updateBikeResult = await this.#bikeService.updateStatusById(
        bike.id, bikeStatus.AVAILABLE
      );
      if ( updateBikeResult.isFailure ) failures.push( updateBikeResult );

      // Updates the dock's status
      const updateDockResult = await this.#dockService.updateStatusById(
        dock.id, dockStatus.OCCUPIED
      );
      if ( updateDockResult.isFailure ) failures.push( updateDockResult );

      // Checks for failures
      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      const bikeAdmission = createAdmissionResult.value;

      const successData = {
        requestedAt: bikeAdmission.requestedAt.toString(), 
        bikeId: bikeAdmission.bikeId, 
        dockId: bikeAdmission.dockId
      }

      await this.#transaction.commit();

      return Result.success( successData );
    } catch ( error ) {
      await this.#transaction.rollback();
      
      if ( error instanceof BaseError )
        return Result.failure( INTERNAL_SERVER_ERROR, error.message );

      throw error;
    }
  }
}
