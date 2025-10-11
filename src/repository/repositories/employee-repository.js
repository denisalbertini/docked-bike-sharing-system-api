import BaseRepository from "../base-repository.js";
import Employee from '../../model/models/employee.js';

export default class EmployeeRepository extends BaseRepository {
  constructor() { super( Employee ); }

  findByRegistration( registration ) {
    return this._handleOperation(
      () => this._model.findOne( { where: registration } )
    );
  }
}
