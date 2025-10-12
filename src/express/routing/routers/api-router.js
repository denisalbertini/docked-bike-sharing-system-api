import express from 'express';

import bikeRouter from './bike-router.js';
import bikerRouter from './biker-router.js';
import chargeRouter from './charge-router.js';
import dockRouter from './dock-router.js';
import employeeRouter from './employee-router.js';
import rentalRouter from './rental-router.js';
import stationRouter from './station-router.js';

const router = express.Router();

router.use( '/bikes', bikeRouter );
router.use( '/bikers', bikerRouter );
router.use( '/charges', chargeRouter );
router.use( '/docks', dockRouter );
router.use( '/employees', employeeRouter );
router.use( '/rentals', rentalRouter );
router.use( '/stations', stationRouter );

export default router;
