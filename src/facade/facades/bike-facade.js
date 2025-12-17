import bikeStatus from '../../model/shared/enum/bike-status.js';
import { BAD_REQUEST_ERROR, NOT_FOUND_ERROR } from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseFacade from '../base-facade.js';

export default class BikeFacade extends BaseFacade {
  #dockService;

  constructor( bikeService, dockService ) {
    super( bikeService );
    this.#dockService = dockService;
  }

  async deleteBike( bikeId ) {
    const failures = [];
    
    // Checks the bike's status
    const bikeStatusResult = await this._modelService.checkStatusById(
      bikeId, bikeStatus.RETIRED
    );
    if ( bikeStatusResult.isFailure ) failures.push( bikeStatusResult );

    // Checks if the bike is docked
    const bikeDockedResult = await this.#dockService.findByBikeId( bikeId );
    if ( bikeDockedResult.isSuccess ) failures.push(
      Result.failure( BAD_REQUEST_ERROR, 'Bike is docked.' )
    );
    else if ( bikeDockedResult.errorType !== NOT_FOUND_ERROR )
      return bikeDockedResult;

    if ( failures.length > 0 ) return Result.mergeFailures( failures );

    // Deletes the bike
    return await this.deleteRecordById( bikeId );
  }
}
