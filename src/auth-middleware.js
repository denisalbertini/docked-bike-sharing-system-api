import jwt from 'jsonwebtoken';

export const athenticateToken = ( req, res, next ) => {
  const authHeader = req.headers[ 'authorization' ];
  const token = authHeader && authHeader.split( ' ' )[ 1 ]; // Bearer Token

  if ( !token ) res.sendStatus( 401 );

  const checksOut = jwt.verify( token, process.env.JWT_SECRET );

  if ( !checksOut ) res.sendStatus( 403 );

  next();
}
