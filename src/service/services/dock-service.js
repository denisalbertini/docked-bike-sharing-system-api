import dockStatus from '../../model/shared/enum/dock-status.js';
import {
    BAD_REQUEST_ERROR,
    NOT_FOUND_ERROR
} from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseService from '../base-service.js';

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

  async checkStatusBySerialNumber( serialNumber, ...status ) {
    const findResult = await this.findBySerialNumber( serialNumber );

    if ( findResult.isSuccess && !status.includes( findResult.value.status ) )
      return Result.failure(
        BAD_REQUEST_ERROR, 
        `Dock is not ${ status.join( ', ' ) }.`
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
        return Result.failure( BAD_REQUEST_ERROR, 'Action not supported.' );
    }
  }

  updateStatusById( id, status, transaction = null ) {
    return this.updateById(
      id, { status }, ...( ( transaction && [ transaction ] ) ?? [] )
    );
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
