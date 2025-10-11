import express from 'express';

import bikeRouter from './bike-router.js';

const router = express.Router();

router.use( '/bikes', bikeRouter );

export default router;
