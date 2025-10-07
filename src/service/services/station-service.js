import BaseService from '../base-service';

export default class StationService extends BaseService {
  findBySerialNumber( serialNumber ) {
    return this.modelRepository.findBySerialNumber( serialNumber );
  }
}
