import express from 'express';
import router from './routing/routers/api-router.js';

const app = express();

app.use( express.json() );
app.use( '/api', router );
app.use( ( err, _req, _res, _next ) => console.error( err ) );

export default app;
