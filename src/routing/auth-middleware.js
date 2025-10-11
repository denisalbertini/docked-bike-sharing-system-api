import jwt from 'jsonwebtoken';
import employeeRole from '../model/shared/enum/employee-role.js';
import { promisify } from 'util';
import { EMAIL_VERIFICATION, ACCESS } from '../model/shared/enum/auth-purpose.js';

const jwtAsyncVerify = promisify( jwt.verify );

function createAuthMiddleware( purpose = null, ...acceptedRoles ) {
  return async ( req, res, next ) => {
    const authHeader = req.headers[ 'authorization' ];
    const token = authHeader && authHeader.split( ' ' )[ 1 ]; // Bearer Token

    if ( !token ) return res.sendStatus( 401 );

    try {
      const payload = await jwtAsyncVerify( token, process.env.JWT_SECRET );

      if ( purpose && payload.purpose !== purpose )
        return res.sendStatus( 403 );

      if ( acceptedRoles && !acceptedRoles.includes( payload.role ) )
        return res.sendStatus( 403 );

      req.user = {
        id: payload.id, 
        role: payload.role, 
        purpose: payload.purpose
      };

      next();
    } catch ( error ) {
      return res.sendStatus( 401 );
    }
  }
}

export const
accountConfirmationAuthMiddleware =
  createAuthMiddleware( EMAIL_VERIFICATION ), 
bikerAuthMiddleware =
  createAuthMiddleware( ACCESS ), 
operatorAuthMiddleware =
  createAuthMiddleware( ACCESS, employeeRole.OPERATOR ), 
adminAuthMiddleware =
  createAuthMiddleware( ACCESS, employeeRole.ADMIN ), 
employeeAuthMiddleware = 
  createAuthMiddleware( ACCESS, Object.values( employeeRole ) );
