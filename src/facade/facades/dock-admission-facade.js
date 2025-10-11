import BaseFacade from '../base-facade.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import Result from '../../model/shared/result.js';
import { INTERNAL_SERVER_ERROR } from '../../model/shared/enum/error-types.js';

export default class DockAdmissionFacade extends BaseFacade {
  #dockService;
  #stationService;
  #transaction;

  constructor(
    dockAdmissionService, 
    dockService, 
    stationService, 
    transaction
  ) {
    super( dockAdmissionService );
    this.#dockService = dockService;
    this.#stationService = stationService;
    this.#transaction = transaction;
  }

  async createDockAdmission( employeeId, dockSerialNumber, stationSerialNumber ) {
    // Checks the dock's status
    const dockStatusResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerialNumber, dockStatus.AVAILABLE, dockStatus.UNDER_MAINTENANCE
    );
    if ( dockStatusResult.isFailure ) return dockStatusResult;

    const dock = dockStatusResult.value;

    // Finds the station
    const findStationResult = await this.#stationService.findBySerialNumber(
      stationSerialNumber
    );
    if ( findStationResult.isFailure ) return findStationResult;

    const station = findStationResult.value;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the admission record
      const createAdmissionResult = await this.createRecord(
        { employeeId, dockId: dock.id }
      );
      if ( createAdmissionResult.isFailure ) {
        await this.#transaction.rollback();
        return createAdmissionResult;
      }

      const dockAdmission = createAdmissionResult.value;

      // Updates the dock
      const dockUpdateResult = await this.#dockService.updateById(
        dock.id, { status: dockStatus.AVAILABLE, stationId: station.id }
      );
      if ( dockUpdateResult.isFailure ) {
        await this.#transaction.rollback();
        return dockUpdateResult;
      }

      await this.#transaction.commit();

      return Result.success( dockAdmission );
    } catch ( error ) {
      await this.#transaction.rollback();
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
