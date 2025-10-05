import BaseService from '../base-service.js';

export default class RentalService extends BaseService {
  findUnfinishedByBikeId( bikeId ) {
    return this.modelRepository.findByNullFinishTimeAndBikeId( bikeId );
  }
  
  findUnfinishedByBikerId( bikerId ) {
    return this.modelRepository.findByNullFinishTimeAndBikerId( bikerId );
  }

  finish( rental ) {
    return this.updateById( rental.id, rental );
  }
}
