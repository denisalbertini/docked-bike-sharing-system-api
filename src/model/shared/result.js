const constructorErrorMessage =
  'Do not use the "new" operator to instantiate Result. Use the static "success" and "failure" methods instead.';

export default class Result {
  static #instantiationToken = Symbol();
  
  #value;
  #errors;
  #errorType;
  
  constructor( token, value, errors, errorType = null ) {
    if ( token !== Result.#instantiationToken )
      throw new Error( constructorErrorMessage );
    
    this.#value = value;
    this.#errors = errors;
    this.errorType = errorType;

    Object.seal( this );
  }

  get value() { return this.#value; }
  get errors() { return this.#errors; }
  get errorType() { return this.#errorType; }
  get isSuccess() { return this.#value != null; }
  get isFailure() { return this.#errors != null; }

  set errorType( errorType ) {
    if ( this.isSuccess() ) errorType = null;
    this.#errorType = errorType;
  }

  static success( value ) {
    return new Result( this.#instantiationToken, value, null );
  }
  static failure( errors, errorType = null ) {
    return new Result( this.#instantiationToken, null, errors, errorType );
  }
}
