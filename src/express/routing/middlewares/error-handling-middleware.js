export const errorHandlingMiddleware = (err, _req, res, _next) => {
  if ( err.status && err.errors )
    return res.status( err.status ).send(
      { errorType: err.name, errors: err.errors }
    );

  console.error( err );
  res.status( 500 ).send( { message: 'Refer to console.' } );
};
