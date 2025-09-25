export default class Result {
  constructor( isSuccess, value, errors, errorType ) {
    this.isSuccess = isSuccess;
    this.value = value;
    this.errors = errors;
    this.errorType = errorType;

    Object.freeze( this );
  }

  static success( value ) {
    return new Result( true, value, null, null );
  }

  static failure( errors, errorType ) {
    return new Result( false, null, errors, errorType );
  }

  get isFailure() {
    return !this.isSuccess;
  }
}
