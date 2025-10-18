import dockStatus from '../../model/shared/enum/dock-status.js';
import { INTERNAL_SERVER_ERROR } from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseFacade from '../base-facade.js';

export default class DockRemovalFacade extends BaseFacade {
  #dockService;
  #transaction;

  constructor(
    dockRemovalService, 
    dockService, 
    transaction
  ) {
    super( dockRemovalService );
    this.#dockService = dockService;
    this.#transaction = transaction;
  }

  async createDockRemoval( { employeeId, dockSerial, action } ) {
    const failures = [];
    
    // Checks the dock's status
    const dockOccupiedResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerial, 
      ...Object.values( dockStatus ).filter( s => s !== dockStatus.OCCUPIED )
    );
    if ( dockOccupiedResult.isFailure ) failures.push( dockOccupiedResult );

    // Gets the new dock status
    const getDockStatusResult = this.#dockService.getStatusByAction( action );
    if ( getDockStatusResult.isFailure ) failures.push( getDockStatusResult );

    // Checks for failures
    if ( failures.length > 0 ) return Result.mergeFailures( failures );

    const dock = dockOccupiedResult.value;
    const newDockStatus = getDockStatusResult.value;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the dock removal record
      const createDockRemoval = await this.createRecord(
        { employeeId, dockId: dock.id }
      );
      if ( createDockRemoval.isFailure ) failures.push( createDockRemoval );

      // Updates the dock's status
      const updateDockResult = await this.#dockService.updateStatusById(
        dock.id, newDockStatus
      );
      if ( updateDockResult.isFailure ) failures.push( updateDockResult );

      // Checks for failures
      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      const dockRemoval = createDockRemoval.value;

      const successData = {
        requestedAt: dockRemoval.requestedAt.toString(), 
        dockId: dockRemoval.dockId, 
        employeeId: dockRemoval.employeeId
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
