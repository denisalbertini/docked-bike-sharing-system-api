import { getBaseClassConstructorMessage } from '../model/shared/constructor-error-message.js';
import Result from '../model/shared/result.js';
import {
  VALIDATION_ERROR, 
  UNIQUE_CONSTRAINT_ERROR, 
  FOREIGN_KEY_CONSTRAINT_ERROR, 
  INTERNAL_SERVER_ERROR
} from '../model/shared/enum/error-types.js';
import { UniqueConstraintError } from 'sequelize';

export default class BaseRepository {
  _model;
  
  constructor( model ) {
    if ( new.target === BaseRepository )
      throw new Error( getBaseClassConstructorMessage( BaseRepository.name ) );
    
    this._model = model;
  }

  #getErrorType( error ) {
    switch ( error.constructor.name ) {
      case 'ValidationError': 
        return VALIDATION_ERROR;
      case 'UniqueConstraintError': 
        return UNIQUE_CONSTRAINT_ERROR;
      case 'ForeignKeyConstraintError':
        return FOREIGN_KEY_CONSTRAINT_ERROR;
      default:
        return INTERNAL_SERVER_ERROR;
    }
  }

  #getErrors( error ) {
    switch ( error.constructor.name ) {
      case 'ValidationError': 
        return error.errors.map( item => item.message );
      default:
        return [ error.message ];
    }
  }
  
  async _handleOperation( operation ) {
    try {
      return Result.success( await operation() );
    } catch ( error ) {
      return Result.failure(
        this.#getErrorType( error ), ...this.#getErrors( error )
      );
    }
  }

  findAll() {
    return this._handleOperation(
      () => this._model.findAll()
    );
  }

  findById( id ) {
    return this._handleOperation(
      () => this._model.findByPk( id )
    );
  }

  create( data ) {
    return this._handleOperation(
      () => this._model.create( data )
    );
  }

  updateById( id, data ) {
    return this._handleOperation(
      () => this._model.update(
        data, { where: { id }, returning: true }
      )
    );
  }

  deleteById( id ) {
    return this._handleOperation(
      () => this._model.destroy( { where: { id } } )
    );
  }
}
