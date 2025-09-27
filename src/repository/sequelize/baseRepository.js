import { getBaseClassConstructorMessage } from '../../constructorErrorMessage.js';
import Result from '../../model/shared/result.js';
import { ValidationError } from 'sequelize';
import errorTypes from '../../errorTypes.js';

export default class BaseRepository {
  #model;
  
  constructor( model ) {
    if ( new.target === BaseRepository )
      throw new Error(
        getBaseClassConstructorMessage( BaseRepository.name )
      );
    
    this.#model = model;
  }

  #getErrorType( error ) {
    switch ( error.constructor.name ) {
      case 'ValidationError': 
        return errorTypes.VALIDATION_ERROR;
      case 'UniqueConstraintError': 
        return errorTypes.UNIQUE_CONSTRAINT_ERROR;
      case 'ForeignKeyConstraintError':
        return errorTypes.FOREIGN_KEY_CONSTRAINT_ERROR;
      default:
        return errorTypes.INTERNAL_SERVER_ERROR;
    }
  }
  
  async #handleOperation( operation ) {
    try {
      return Result.success( await operation() );
    } catch ( error ) {
      const errors =
        error instanceof ValidationError ? 
        error.errors.map( item => item.message ) : 
        [ error.message ];

      const errorType = this.#getErrorType( error );
      
      return Result.failure( errors, errorType );
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
