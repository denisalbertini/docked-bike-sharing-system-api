import express from 'express';
import { errorHandlingMiddleware } from './routing/middlewares/error-handling-middleware.js';
import { openapiValidatorMiddleware } from './routing/middlewares/openapi-validator-middleware.js';
import router from './routing/routers/api-router.js';

const app = express();

app.use( express.json() );
app.use( openapiValidatorMiddleware );
app.use( '/api', router );
app.use( errorHandlingMiddleware );

export default app;
