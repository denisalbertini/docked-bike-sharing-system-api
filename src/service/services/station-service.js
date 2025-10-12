import BaseService from '../base-service.js';

export default class StationService extends BaseService {
  constructor( stationRepository ) { super( stationRepository ); }
  
  findBySerialNumber( serialNumber ) {
    return this._modelRepository.findBySerialNumber( serialNumber );
  }
}
