import express from 'express';
import router from './index.js';

const app = express();

app.use( '/api', router );

export default app;
