import BaseService from '../base-service.js';
import {
  NOT_FOUND_ERROR, 
  PRECONDITION_FAILED_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import dockStatus from '../../model/shared/enum/dock-status.js';

export default class DockService extends BaseService {
  constructor( dockRepository ) { super( dockRepository ); }
  
  async findBySerialNumber( serialNumber ) {
    const findResult = await this._modelRepository.findBySerialNumber(
      serialNumber
    );

    if ( findResult.isSuccess && findResult.value === null )
      return Result.failure( NOT_FOUND_ERROR, 'Dock not found.' );

    return findResult;
  }

  async checkStatusBySerialNumber( serialNumber, status ) {
    const findResult = await this.findBySerialNumber( serialNumber );

    if ( findResult.isSuccess && findResult.value.status !== status )
      return Result.failure(
        PRECONDITION_FAILED_ERROR, 
        `Dock is not ${ status.replace( '_', ' ' ) }.`
      );

    return findResult;
  }

  updateStatusById( id, status ) {
    return this.updateById( id, { status } );
  }

  async findByBikeId( bikeId ) {
    const findResult = await this._modelRepository.findByBikeId( bikeId );
    if ( findResult.isSuccess && findResult.value === null )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Dock not found'
      );

    return findResult;
  }

  getStatusByAction( action ) {
    switch ( action ) {
      case 'REPAIR':
        return Result.success( dockStatus.UNDER_MAINTENANCE );
      case 'RETIRE':
        return Result.success( dockStatus.DECOMMISSIONED );
      default:
        return Result.failure(
          VALIDATION_ERROR, 
          'Action not supported.'
        );
    }
  }

  async findAllByStationId( stationId ) {
    const findResult = await this._modelRepository.findAllByStationId(
      stationId
    );

    if ( findResult.isSuccess && findResult.value.length === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 'No docks found.'
      );

    return findResult;
  }
}
