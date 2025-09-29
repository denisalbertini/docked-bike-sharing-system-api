import { getBaseClassConstructorMessage } from '../constructor-error-message.js';
import Result from '../model/shared/result.js';
import { NOT_FOUND_ERROR } from '../error-types.js';

export default class BaseService {
  #modelRepository;

  constructor( modelRepository ) {
    if ( new.target === BaseService )
      throw new Error(
        getBaseClassConstructorMessage( BaseService.name )
      );

    this.#modelRepository = modelRepository;
  }

  async findAll() {
    const result = await this.#modelRepository.findAll();

    if ( result.isSuccess && result.value.length === 0 )
      return Result.failure(
        [ 'No entries found.' ], 
        NOT_FOUND_ERROR
      );
    
    return result;
  }

  async findById( id ) {
    const result = await this.#modelRepository.findById( id );

    if ( result.isSuccess && result.value === null )
      return Result.failure(
        [ 'No entry found.' ], 
        NOT_FOUND_ERROR
      );

    return result;
  }

  async create( values ) {
    return await this.#modelRepository.create( values );
  }

  async update( id, updates ) {
    const bikeResult = await this.findById( id );
    if ( bikeResult.isFailure ) return bikeResult;

    const bike = bikeResult.value;

    return await this.#modelRepository.update( bike, updates );
  }

  async deleteById( id ) {
    const result = await this.#modelRepository.deleteById( id );

    if ( result.isSuccess && result.value === 0 )
      return Result.failure(
        [ 'Entry does not exist.' ], 
        NOT_FOUND_ERROR
      );

    return result;
  }
}
