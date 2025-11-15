import { BaseError } from 'sequelize';
import dockStatus from '../../model/shared/enum/dock-status.js';
import { INTERNAL_SERVER_ERROR } from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseFacade from '../base-facade.js';

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

  async createDockAdmission( { employeeId, dockSerial, stationSerial } ) {
    const failures = [];
    
    // Checks the dock's status
    const dockStatusResult = await this.#dockService.checkStatusBySerialNumber(
      dockSerial, dockStatus.OPERATIONAL, dockStatus.UNDER_MAINTENANCE
    );
    if ( dockStatusResult.isFailure ) failures.push( dockStatusResult );

    // Finds the station
    const findStationResult = await this.#stationService.findBySerialNumber(
      stationSerial
    );
    if ( findStationResult.isFailure ) failures.push( findStationResult );

    // Checks for failures
    if ( failures.length > 0 ) return Result.mergeFailures( failures );

    const dock = dockStatusResult.value;
    const station = findStationResult.value;

    // Tries to finalize the process with a transaction
    try {
      await this.#transaction.start();

      // Creates the admission record
      const createAdmissionResult = await this.createRecord(
        { employeeId, dockId: dock.id }
      );
      if ( createAdmissionResult.isFailure )
        failures.push( createAdmissionResult );

      // Updates the dock
      const dockUpdateResult = await this.#dockService.updateById(
        dock.id, { status: dockStatus.AVAILABLE, stationId: station.id }
      );
      if ( dockUpdateResult.isFailure )
        failures.push( dockUpdateResult );

      // Checks for failures
      if ( failures.length > 0 ) {
        await this.#transaction.rollback();
        return Result.mergeFailures( failures );
      }

      const dockAdmission = createAdmissionResult.value;

      const successData = {
        ...dockAdmission.toJSON(), 
        requestedAt: dockAdmission.requestedAt.toISOString()
      };

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
