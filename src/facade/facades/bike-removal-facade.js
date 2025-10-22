import bikeStatus from '../../model/shared/enum/bike-status.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import {
  INTERNAL_SERVER_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseFacade from '../base-facade.js';

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
    { employeeId, bikeSerial, dockSerial, action }
  ) {
    const failures = [];
        
    // Checks the bike's status
    const bikeStatusResult = await this.#bikeService.checkStatusBySerialNumber(
      bikeSerial, bikeStatus.MAINTENANCE_REQUESTED
    );
    if ( bikeStatusResult.isFailure ) failures.push( bikeStatusResult );

    // Checks the dock's status
    const dockStatusResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerial, dockStatus.OCCUPIED
    );
    if ( dockStatusResult.isFailure ) failures.push( dockStatusResult );

    // Checks for failures
    if ( failures.length > 0 ) return Result.mergeFailures( failures );

    const bike = bikeStatusResult.value;
    const dock = dockStatusResult.value;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the removal record
      const createRemovalResult = await this.createRecord(
        { employeeId, bikeId: bike.id }
      );
      if ( createRemovalResult.isFailure ) failures.push( createRemovalResult );

      // Gets the new bike status
      const newBikeStatusResult = this.#bikeService.getStatusByAction( action );
      if ( newBikeStatusResult.isFailure ) failures.push( newBikeStatusResult );

      const newBikeStatus = newBikeStatusResult.value ?? {};
      
      // Updates the bike's status
      const updateBikeResult = await this.#bikeService.updateStatusById(
        bike.id, newBikeStatus
      );
      if ( updateBikeResult.isFailure ) failures.push( updateBikeResult );

      // Updates the dock's status
      const updateDockResult = await this.#dockService.updateStatusById(
        dock.id, dockStatus.AVAILABLE
      );
      if ( updateDockResult.isFailure ) failures.push( updateDockResult );

      // Checks for failures
      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      const bikeRemoval = createRemovalResult.value;

      const successData = {
        ...bikeRemoval.dataValues, 
        requestedAt: bikeRemoval.requestedAt.toString()
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
