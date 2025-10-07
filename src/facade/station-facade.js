import Result from '../model/shared/result.js';
import {
  NOT_FOUND_ERROR, 
  PRECONDITION_FAILED_ERROR
} from '../error-types.js';

export default class StationFacade {
  #stationService;
  #dockService;

  constructor( stationService, dockService ) {
    this.#stationService = stationService;
    this.#dockService = dockService;
  }

  async deleteStation( stationId ) {
    // Checks if there is any dock on the station
    const findDockResult = await this.#dockService.findAllByStationId(
      stationId
    );
    if ( findDockResult.isSuccess ) return Result.failure(
      PRECONDITION_FAILED_ERROR, 'There are docks on the station.'
    );
    if ( findDockResult.errorType !== NOT_FOUND_ERROR ) return findDockResult;

    // Deletes the station
    return await this.#stationService.deleteById( stationId );
  }
}
