import { getBaseClassConstructorMessage } from '../model/shared/constructor-error-message.js';
import { NOT_FOUND_ERROR } from '../model/shared/enum/error-types.js';
import Result from '../model/shared/result.js';

export default class BaseService {
  _modelRepository;

  constructor( modelRepository ) {
    if ( new.target === BaseService )
      throw new Error(
        getBaseClassConstructorMessage( BaseService.name )
      );

    this._modelRepository = modelRepository;
  }

  async findAll() {
    const result = await this._modelRepository.findAll();

    if ( result.isSuccess && result.value.length === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'No entries found.'
      );
    
    return result;
  }

  async findById( id ) {
    const result = await this._modelRepository.findById( id );

    if ( result.isSuccess && result.value === null )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'No entry found.'
      );

    return result;
  }

  create( data, transaction = null ) {
    return this._modelRepository.create(
      data, ...( ( transaction && [ transaction ] ) ?? [] )
    );
  }

  async updateById( id, data, transaction = null ) {
    const updateResult = await this._modelRepository.updateById(
      id, data, ...( ( transaction && [ transaction ] ) ?? [] )
    );
    if ( updateResult.isFailure ) return updateResult;

    const [ affectedRows, [ updatedEntry ] = [] ] = updateResult.value;

    if ( affectedRows === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'No updates were made.'
      );

    return Result.success( updatedEntry );
  }

  async deleteById( id, transaction = null ) {
    const result = await this._modelRepository.deleteById(
      id, ...( ( transaction && [ transaction ] ) ?? [] )
    );

    if ( result.isSuccess && result.value === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Entry does not exist.'
      );

    return result;
  }
}
