import BaseRepository from "../base-repository";
import Employee from '../../../model/sequelize/models/employee.js';

export default class EmployeeRepository extends BaseRepository {
  constructor() { super( Employee ); }

  findByRegistration( registration ) {
    return this.handleOperation(
      () => this.model.findOne( { where: registration } )
    );
  }
}
