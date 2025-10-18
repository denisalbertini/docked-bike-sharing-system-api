import bikeStatus from '../../model/shared/enum/bike-status.js';
import {
  NOT_FOUND_ERROR,
  PRECONDITION_FAILED_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseService from '../base-service.js';

export default class BikeService extends BaseService {
  constructor( bikeRepository ) { super( bikeRepository ); }
  
  async findBySerialNumber( serialNumber ) {
    const findResult = await this._modelRepository.findBySerialNumber(
      serialNumber
    );

    if ( findResult.isSuccess && findResult.value === null )
      return Result.failure( NOT_FOUND_ERROR, 'Bike not found.' );

    return findResult;
  }

  async checkStatusById( id, ...status ) {
    const findResult = await this.findById( id );

    if ( findResult.isSuccess && !status.includes( findResult.value.status ) )
      return Result.failure(
        PRECONDITION_FAILED_ERROR, 
        `Bike is not ${ status.join( ', ' )}.`
      );

    return findResult;
  }

  async checkStatusBySerialNumber( serialNumber, ...status ) {
    const findResult = await this.findBySerialNumber( serialNumber );

    if ( findResult.isSuccess && !status.includes( findResult.value.status ) )
      return Result.failure(
        PRECONDITION_FAILED_ERROR, 
        `Bike is not ${ status.join( ', ' )}.`
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
