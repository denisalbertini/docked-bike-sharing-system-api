import BaseSerice from '../base-service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import {
  AUTHENTICATION_ERROR, 
  INTERNAL_SERVER_ERROR
} from '../../error-types.js';
import Result from '../../model/shared/result.js';
import { ACCESS } from '../../auth-purpose.js';

const jwtAsyncSign = promisify( jwt.sign );

export default class EmployeeService extends BaseSerice {
  async login( registration, password ) {
    const findResult = await this.modelRepository.findByRegistration( registration );
    if ( findResult.isFailure ) return findResult;

    const employee = findResult.value;

    try {
      const checksOut = await bcrypt.compare( password, employee.password );

      if ( !checksOut )
        return Result.failure( AUTHENTICATION_ERROR, 'Incorrect credentials.' );
      
      const token = await jwtAsyncSign(
        { id: employee.id, role: employee.role, purpose: ACCESS }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );

      return Result.success( token );
    } catch ( error ) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
