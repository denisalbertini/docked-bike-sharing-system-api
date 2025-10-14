import express from 'express';
import router from './routing/routers/api-router.js';

const app = express();

app.use( express.json() );
app.use( '/api', router );
app.use(
  ( err, _req, res, _next ) => {
    console.error( err );
    res.sendStatus( 500 );
  }
);

export default app;
