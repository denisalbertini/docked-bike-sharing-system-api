import BaseFacade from '../base-facade.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import Result from '../../model/shared/result.js';
import { INTERNAL_SERVER_ERROR } from '../../model/shared/enum/error-types.js';

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

  async createDockRemoval( employeeId, dockSerialNumber, action ) {
    // Checks the dock's status
    const dockOccupiedResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerialNumber, 
      ...dockStatus.filter( status => status !== dockStatus.OCCUPIED )
    );
    if ( dockOccupiedResult.isFailure ) return dockOccupiedResult;

    const dock = dockOccupiedResult.value;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the dock removal record
      const createDockRemoval = await this.createRecord(
        { employeeId, dockId: dock.id }
      );
      if ( createDockRemoval.isFailure ) {
        await this.#transaction.rollback();
        return createDockRemoval;
      }

      const dockRemoval = createDockRemoval.value;

      // Gets the new dock status
      const getDockStatusResult = this.#dockService.getStatusByAction( action );
      if ( getDockStatusResult.isFailure ) {
        await this.#transaction.rollback();
        return getDockStatusResult;
      }

      const newDockStatus = getDockStatusResult.value;

      // Updates the dock's status
      const updateDockResult = await this.#dockService.updateStatusById(
        dock.id, newDockStatus
      );
      if ( updateDockResult.isFailure ) {
        await this.#transaction.rollback();
        return updateDockResult;
      }

      await this.#transaction.commit();

      return Result.success( dockRemoval );
    } catch ( error ) {
      await this.#transaction.rollback();
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
