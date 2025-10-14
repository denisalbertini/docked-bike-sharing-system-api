import BaseFacade from '../base-facade.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import { NOT_FOUND_ERROR, PRECONDITION_FAILED_ERROR } from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';

export default class BikeFacade extends BaseFacade {
  #dockService;

  constructor( bikeService, dockService ) {
    super( bikeService );
    this.#dockService = dockService;
  }

  async deleteBike( bikeId ) {
    const errors = []
    
    // Checks the bike's status
    const bikeStatusResult = await this._modelService.checkStatusById(
      bikeId, bikeStatus.RETIRED
    );
    if ( bikeStatusResult.isFailure ) {
      if ( bikeStatusResult.errorType !== PRECONDITION_FAILED_ERROR )
        return bikeStatusResult;
      
      errors.push( ...bikeStatusResult.errors );
    }

    // Checks if the bike is docked
    const bikeDockedResult = await this.#dockService.findByBikeId( bikeId );
    if ( bikeDockedResult.isSuccess ) errors.push( 'Bike is docked.' );
    else if ( bikeDockedResult.errorType !== NOT_FOUND_ERROR )
      return bikeDockedResult;

    if ( errors.length > 0 ) return Result.failure(
      PRECONDITION_FAILED_ERROR, ...errors
    );

    // Deletes the bike
    return await this.deleteRecordById( bikeId );
  }
}
