import BaseService from '../base-service.js';

export default class RentalService extends BaseService {
  constructor( rentalRepository ) { super( rentalRepository ); }
  
  findUnfinishedByBikeId( bikeId ) {
    return this._modelRepository.findByNullFinishTimeAndBikeId( bikeId );
  }
  
  findUnfinishedByBikerId( bikerId ) {
    return this._modelRepository.findByNullFinishTimeAndBikerId( bikerId );
  }

  finishById( id, data ) {
    return this.updateById( id, data );
  }
}
