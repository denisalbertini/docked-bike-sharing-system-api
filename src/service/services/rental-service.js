import { NOT_FOUND_ERROR } from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseService from '../base-service.js';

export default class RentalService extends BaseService {
  constructor( rentalRepository ) { super( rentalRepository ); }
  
  async findUnfinishedByBikerId( bikerId ) {
    const findResult = await this._modelRepository.findByNullFinishTimeAndBikerId(
      bikerId
    );

    if ( findResult.isSuccess && findResult.value === null ) return Result.failure(
      NOT_FOUND_ERROR, 'Rental not found.'
    );

    return findResult;
  }
  
  async findUnfinishedByBikeId( bikeId ) {
    const findResult = await this._modelRepository.findByNullFinishTimeAndBikeId(
      bikeId
    );

    if ( findResult.isSuccess && findResult.value === null ) return Result.failure(
      NOT_FOUND_ERROR, 'Rental not found.'
    );

    return findResult;
  }
}
