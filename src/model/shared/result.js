export default class Result {
  constructor( isSuccess, value, errors ) {
    this.isSuccess = isSuccess;
    this.value = value;
    this.errors = errors;

    Object.freeze( this );
  }

  static success( value ) {
    return new Result( true, value, null );
  }

  static failure( errors ) {
    return new Result( false, null, errors );
  }

  get isFailure() {
    return !this.isSuccess;
  }
}
