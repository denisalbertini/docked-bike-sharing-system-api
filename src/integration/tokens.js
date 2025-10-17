import jwt from 'jsonwebtoken';
import { ACCESS, CHARGE_FEES } from '../model/shared/enum/auth-purpose.js';
import employeeRole from '../model/shared/enum/employee-role.js';

export const operatorToken = jwt.sign(
  { purpose: ACCESS, role: employeeRole.OPERATOR },
  process.env.JWT_SECRET
);

export const adminToken = jwt.sign(
  { purpose: ACCESS, role: employeeRole.ADMIN },
  process.env.JWT_SECRET
);

export const bikerToken = jwt.sign({ purpose: ACCESS }, process.env.JWT_SECRET);

export const emailConfirmationToken = (id, purpose) =>
  jwt.sign({ id, purpose }, process.env.JWT_SECRET);

export const schedulerToken = jwt.sign(
  { purpose: CHARGE_FEES },
  process.env.JWT_SECRET
);
