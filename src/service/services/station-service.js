import BaseService from '../base-service.js';

export default class StationService extends BaseService {
  findBySerialNumber( serialNumber ) {
    return this._modelRepository.findBySerialNumber( serialNumber );
  }
}
