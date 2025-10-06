import BaseSerice from '../base-service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export default class EmployeeService extends BaseSerice {
  async login( registration, password ) {
    const findResult = await this.modelRepository.findByRegistration( registration );
    if ( findResult.isFailure ) return findResult;

    const employee = findResult.value;

    const checksOut = await bcrypt.compare( password, employee.password );

    if ( !checksOut )
      return Result.failure( VALIDATION_ERROR, 'Incorrect credentials.' );

    const jwtAsyncSign = promisify( jwt.sign );
    const token = await jwtAsyncSign(
      { role: employee.role }, process.env.JWT_SECRET, { expiresIn: '7d' }
    );

    return Result.success( token );
  }
}
