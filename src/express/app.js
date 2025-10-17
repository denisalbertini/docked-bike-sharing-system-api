import express from 'express';
import router from './routing/routers/api-router.js';

const app = express();

app.use( express.json() );
app.use( '/api', router );
app.use(
  ( err, _req, res, _next ) => {
    console.error( err );
    res.status( 500 ).send( { message: 'Refer to console.' } );
  }
);

export default app;
