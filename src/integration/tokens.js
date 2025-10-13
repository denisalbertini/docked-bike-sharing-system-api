import jwt from 'jsonwebtoken';
import {
  ACCESS,
  EMAIL_VERIFICATION,
} from '../model/shared/enum/auth-purpose.js';
import employeeRole from '../model/shared/enum/employee-role.js';

export const operatorToken = jwt.sign(
  { purpose: ACCESS, role: employeeRole.OPERATOR },
  process.env.JWT_SECRET
);

export const adminToken = jwt.sign(
  { purpose: ACCESS, role: employeeRole.ADMIN },
  process.env.JWT_SECRET
);
