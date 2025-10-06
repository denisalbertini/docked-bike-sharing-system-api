import jwt from 'jsonwebtoken';
import employeeRole from './model/shared/enum/employee-role.js';
import { promisify } from 'util';

const jwtAsyncVerify = promisify( jwt.verify );

function createAuthenticationMiddleware( role = null, purpose = null ) {
  return async ( req, res, next ) => {
    const authHeader = req.headers[ 'authorization' ];
    const token = authHeader && authHeader.split( ' ' )[ 1 ];

    if ( !token ) return res.sendStatus( 401 );

    try {
      const payload = await jwtAsyncVerify( token, process.env.JWT_SECRET );

      if (
        ( role && role !== payload.role ) || 
        ( purpose && payload.purpose !== 'email_verification' )
      ) return res.sendStatus( 403 );

      if ( purpose ) req.bikerId = payload.bikerId;

      next();
    } catch ( error ) {
      return res.sendStatus( 403 );
    }
  }
}

const authenticateAccountConfirmationToken = createAuthenticationMiddleware( null, true );
const authenticateBikerToken = createAuthenticationMiddleware();
const authenticateOperatorToken = createAuthenticationMiddleware( employeeRole.OPERATOR );
const authenticateAdminToken = createAuthenticationMiddleware( employeeRole.ADMIN );

export {
  authenticateAccountConfirmationToken, 
  authenticateBikerToken, 
  authenticateOperatorToken, 
  authenticateAdminToken
};
