import {
    BAD_REQUEST_ERROR,
    NOT_FOUND_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseFacade from '../base-facade.js';

export default class StationFacade extends BaseFacade {
  #dockService;

  constructor( stationService, dockService ) {
    super( stationService );
    this.#dockService = dockService;
  }

  async deleteStation( stationId ) {
    // Checks if there is any dock on the station
    const findDockResult = await this.#dockService.findAllByStationId(
      stationId
    );
    if ( findDockResult.isSuccess ) return Result.failure(
      BAD_REQUEST_ERROR, 'There are docks on the station.'
    );
    if ( findDockResult.errorType !== NOT_FOUND_ERROR ) return findDockResult;

    // Deletes the station
    return await this.deleteRecordById( stationId );
  }
}
