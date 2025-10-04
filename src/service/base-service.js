import { getBaseClassConstructorMessage } from '../constructor-error-message.js';
import Result from '../model/shared/result.js';
import { NOT_FOUND_ERROR } from '../error-types.js';

export default class BaseService {
  modelRepository;

  constructor( modelRepository ) {
    if ( new.target === BaseService )
      throw new Error(
        getBaseClassConstructorMessage( BaseService.name )
      );

    this.modelRepository = modelRepository;
  }

  async findAll() {
    const result = await this.modelRepository.findAll();

    if ( result.isSuccess && result.value.length === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'No entries found.'
      );
    
    return result;
  }

  async findById( id ) {
    const result = await this.modelRepository.findById( id );

    if ( result.isSuccess && result.value === null )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'No entry found.'
      );

    return result;
  }

  async create( data ) {
    return await this.modelRepository.create( data );
  }

  async updateById( id, data ) {
    const result = await this.modelRepository.updateById( id, data );

    const [ affectedRows, [ updatedEntry ] ] = result.value;

    if ( result.isSuccess && affectedRows !== 1 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Entry does not exist.'
      );

    return Result.success( updatedEntry );
  }

  async deleteById( id ) {
    const result = await this.modelRepository.deleteById( id );

    if ( result.isSuccess && result.value === 0 )
      return Result.failure(
        NOT_FOUND_ERROR, 
        'Entry does not exist.'
      );

    return result;
  }
}
