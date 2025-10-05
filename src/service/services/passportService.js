import BaseService from '../base-service.js';
import Result from '../../model/shared/result.js';

export default class PassportService extends BaseService {
  async findByBikerId( id ) {
    const result = await this.modelRepository.findByBikerId( id );

    if ( result.isSuccess && result.value === null )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Passport not found.'
      );

    return result;
  }
}
