import BaseRepository from "../baseRepository";
import Employee from '../../../model/sequelize/models/employee.js';

export default class EmployeeRepository extends BaseRepository {
  constructor() { super( Employee ); }
}
