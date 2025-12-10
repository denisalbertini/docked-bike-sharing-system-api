import Result from '../../model/shared/result.js';
import BaseService from '../base-service.js';

export default class PassportService extends BaseService {
  constructor( passportRepository ) { super( passportRepository ); }
  
  async findByBikerId( id ) {
    const result = await this._modelRepository.findByBikerId( id );

    if ( result.isSuccess && result.value === null )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Passport not found.'
      );

    return result;
  }

  async updateByBikerId( bikerId, data, transaction = null ) {
    const updateResult = await this._modelRepository.updateByBikerId(
      bikerId, data, ...( ( transaction && [ transaction ] ) ?? [] )
    );
    if ( updateResult.isFailure ) return updateResult;

    const [ affectedRows, [ updatedEntry ] = [] ] = updateResult.value;

    if ( affectedRows === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Entry does not exist.'
      );

    return Result.success( updatedEntry );
  }
}
