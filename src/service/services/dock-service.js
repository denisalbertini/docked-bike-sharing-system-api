import BaseService from '../base-service.js';
import {
  NOT_FOUND_ERROR, 
  PRECONDITION_FAILED_ERROR
} from '../../error-types.js';
import Result from '../../model/shared/result.js';

export default class DockService extends BaseService {
  async findBySerialNumber( serialNumber ) {
    const findResult = await this.modelRepository.findBySerialNumber(
      serialNumber
    );

    if ( findResult.isFailure && findResult.errorType === NOT_FOUND_ERROR )
      return Result.failure( NOT_FOUND_ERROR, 'Dock not found.' );

    return findResult;
  }

  async checkStatusBySerialNumber( serialNumber, status ) {
    const findResult = await this.findBySerialNumber( serialNumber );

    if ( findResult.isSuccess && findResult.value.status !== status )
      return Result.failure(
        PRECONDITION_FAILED_ERROR, 
        `Dock is not ${ status.toLowerCase() }.`
      );

    return findResult;
  }

  updateStatusById( id, status ) {
    return this.updateById( id, { status } );
  }

  async findByBikeId( bikeId ) {
    const findResult = await this.modelRepository.findByBikeId( bikeId );
    if ( findResult.isSuccess && findResult.value === null )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Dock not found'
      );

    return findResult;
  }
}
