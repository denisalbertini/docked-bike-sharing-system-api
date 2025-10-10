import BaseFacade from '../base-facade.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';

export default class BikeFacade extends BaseFacade {
  #dockService;

  constructor( bikeService, dockService ) {
    super( bikeService );
    this.#dockService = dockService;
  }

  async deleteBike( bikeId ) {
    // Checks the bike's status
    const bikeStatusResult = await this._modelService.checkStatusById(
      bikeStatus.RETIRED
    );
    if ( bikeStatusResult.isFailure ) return bikeStatusResult;

    // Checks if the bike is docked
    const bikeDockedResult = await this.#dockService.findByBikeId( bikeId );
    if ( bikeDockedResult.isFailure ) return bikeDockedResult;

    // Deletes the bike
    return await this.deleteRecordById( bikeId );
  }
}
