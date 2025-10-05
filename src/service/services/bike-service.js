import BaseService from '../base-service.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import Result from '../../model/shared/result.js';
import { PRECONDITION_FAILED_ERROR } from '../../error-types.js';

export default class BikeService extends BaseService {
  async findBySerialNumber( serialNumber ) {
    const findResult = await this.modelRepository.findBySerialNumber(
      serialNumber
    );

    if ( findResult.isFailure && findResult.errorType === NOT_FOUND_ERROR )
      return Result.failure( NOT_FOUND_ERROR, 'Bike not found.' );

    return findResult;
  }
  
  async isAvailable( id ) {
    const findResult = await this.findById( id );

    if ( findResult.isSuccess && findResult.value.status !== bikeStatus.AVAILABLE )
      return Result.failure( PRECONDITION_FAILED_ERROR, 'Bike is not available.' );

    return findResult;
  }

  async isRented( serialNumber ) {
    const findResult = await this.findBySerialNumber( serialNumber );

    if ( findResult.isSuccess && findResult.value.status !== bikeStatus.RENTED )
      return Result.failure( PRECONDITION_FAILED_ERROR, 'Bike is not rented.' );

    return findResult;
  }

  updateStatus( id, status ) {
    return this.updateById( id, { status } );
  }
}
