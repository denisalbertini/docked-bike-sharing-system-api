import { ValidationError } from 'sequelize';
import errorMessages from '../../errorMessages.js';
import Result from '../../model/shared/result.js';

export default class BaseRepository {
  #model;
  
  constructor( model ) {
    if ( new.target === BaseRepository )
      throw new Error(
        errorMessages.BASE_CLASS_CONSTRUCTOR_MESSAGE( BaseRepository.name )
      );
    
    this.#model = model;
  }
  
  async #handleOperation( operation ) {
    try {
      return Result.success( await operation() );
    } catch ( error ) {
      const errors =
        error instanceof ValidationError ? 
        error.errors.map( item => item.message ) : 
        [ error.message ];
      
      return Result.failure( errors );
    }
  }

  findAll() {
    return this.#handleOperation(
      () => this.#model.findAll()
    );
  }

  findById( id ) {
    return this.#handleOperation(
      () => this.#model.findByPk( id )
    );
  }

  create( attributes ) {
    return this.#handleOperation(
      () => this.#model.create( attributes )
    );
  }

  save( modelInstance ) {
    return this.#handleOperation(
      () => modelInstance.save()
    );
  }

  deleteById( id ) {
    return this.#handleOperation(
      () => this.#model.destroy( { where: { id } } )
    );
  }
}
