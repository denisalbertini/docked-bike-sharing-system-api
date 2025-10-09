import { getBaseClassConstructorMessage } from '../constructor-error-message.js';
import Result from '../model/shared/result.js';
import { NOT_FOUND_ERROR } from '../error-types.js';

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

  async create( data ) {
    return await this._modelRepository.create( data );
  }

  async updateById( id, data ) {
    const updateResult = await this._modelRepository.updateById( id, data );
    if ( updateResult.isFailure ) return updateResult;

    const [ affectedRows, [ updatedEntry ] ] = updateResult.value;

    if ( affectedRows === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Entry does not exist.'
      );

    return Result.success( updatedEntry );
  }

  async deleteById( id ) {
    const result = await this._modelRepository.deleteById( id );

    if ( result.isSuccess && result.value === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Entry does not exist.'
      );

    return result;
  }
}
