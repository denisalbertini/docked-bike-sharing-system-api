import BaseService from '../base-service.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import Result from '../../model/shared/result.js';
import { PRECONDITION_FAILED_ERROR } from '../../model/shared/enum/error-types.js';

export default class BikeService extends BaseService {
  async findBySerialNumber( serialNumber ) {
    const findResult = await this._modelRepository.findBySerialNumber(
      serialNumber
    );

    if ( findResult.isFailure && findResult.errorType === NOT_FOUND_ERROR )
      return Result.failure( NOT_FOUND_ERROR, 'Bike not found.' );

    return findResult;
  }

  async checkStatusById( id, ...status ) {
    const findResult = await this.findById( id );

    if ( findResult.isSuccess && !status.includes( findResult.value.status ) )
      return Result.failure(
        PRECONDITION_FAILED_ERROR, 
        'Bike does not match preconditions.'
      );

    return findResult;
  }

  async checkStatusBySerialNumber( serialNumber, ...status ) {
    const findResult = await this.findBySerialNumber( serialNumber );

    if ( findResult.isSuccess && !status.includes( findResult.value.status ) )
      return Result.failure(
        PRECONDITION_FAILED_ERROR, 
        'Bike does not match preconditions.'
      );

    return findResult;
  }

  updateStatusById( id, status ) {
    return this.updateById( id, { status } );
  }

  getStatusByAction( action ) {
    switch ( action ) {
      case 'REPAIR':
        return Result.success( bikeStatus.UNDER_MAINTENANCE );
      case 'RETIRE':
        return Result.success( bikeStatus.RETIRED );
      default:
        return Result.failure(
          VALIDATION_ERROR, 
          'Action not supported.'
        );
    }
  }
}
