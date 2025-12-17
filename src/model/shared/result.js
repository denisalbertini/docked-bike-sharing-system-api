import {
  BAD_REQUEST_ERROR,
  FOREIGN_KEY_CONSTRAINT_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  UNIQUE_CONSTRAINT_ERROR
} from './enum/error-types.js';

const constructorErrorMessage =
  'Do not use the "new" operator to instantiate Result. Use the static "success" and "failure" methods instead.';

export default class Result {
  static #instantiationToken = Symbol();
  
  #value;
  #errors;
  #errorType;
  
  constructor( token, value, errors, errorType ) {
    if ( token !== Result.#instantiationToken )
      throw new Error( constructorErrorMessage );
    
    this.#value = value;
    this.#errors = errors;
    this.#errorType = errorType;

    Object.seal( this );
  }

  get value() { return this.#value; }
  get errors() { return this.#errors; }
  get errorType() { return this.#errorType; }
  get isSuccess() { return this.#errors === null; }
  get isFailure() { return this.#errors !== null; }

  static success( value = null ) {
    return new Result(
      this.#instantiationToken, 
      value, 
      null, 
      null
    );
  }
  static failure( errorType, ...errors ) {
    return new Result(
      this.#instantiationToken, 
      null, 
      errors, 
      errorType
    );
  }

  static mergeFailures( failures ) {
    const errorTypes = [];
    const errors = [];

    for ( const failure of failures ) {
      errorTypes.push( failure.errorType );
      errors.push( ...failure.errors );
    }

    const errorType = 
      errorTypes.find( t => t === BAD_REQUEST_ERROR ) ?? 
      errorTypes.find( t => t === NOT_FOUND_ERROR ) ?? 
      errorTypes.find( t => t === UNIQUE_CONSTRAINT_ERROR ) ?? 
      errorTypes.find( t => t === FOREIGN_KEY_CONSTRAINT_ERROR ) ?? 
      INTERNAL_SERVER_ERROR;

    return Result.failure( errorType, ...errors );
  }
}
