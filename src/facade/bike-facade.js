import bikeStatus from '../model/shared/enum/bike-status.js';

export default class BikeFacade {
  #bikeService;
  #dockService;

  constructor( bikeService, dockService ) {
    this.#bikeService = bikeService;
    this.#dockService = dockService;
  }

  async deleteBike( bikeId ) {
    // Checks the bike's status
    const bikeStatusResult = await this.#bikeService.checkStatusById(
      bikeStatus.RETIRED
    );
    if ( bikeStatusResult.isFailure ) return bikeStatusResult;

    // Checks if the bike is docked
    const bikeDockedResult = await this.#dockService.findByBikeId( bikeId );
    if ( bikeDockedResult.isFailure ) return bikeDockedResult;

    // Deletes the bike
    return await this.#bikeService.deleteById( bikeId );
  }
}
