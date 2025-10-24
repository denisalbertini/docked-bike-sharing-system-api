import express from 'express';

import bikeRouter from './bike-router.js';
import bikerRouter from './biker-router.js';
import chargeRouter from './charge-router.js';
import dockRouter from './dock-router.js';
import employeeRouter from './employee-router.js';
import rentalRouter from './rental-router.js';
import specRouter from './spec-router.js';
import stationRouter from './station-router.js';

const router = express.Router();

router.use( '/bikes', bikeRouter
  /*
  #swagger.tags = ['Bikes']
  #swagger.security = [ { "EmployeeAuth": [] } ]
  #swagger.responses[401] = {
    description: 'Unauthorized - Employee authentication required'
  }
  #swagger.responses[403] = {
    description: 'Forbidden - Insufficient credentials'
  }
  */
);
router.use( '/bikers', bikerRouter
  /*
  #swagger.tags = ['Bikers']
  #swagger.security = [ { "BikerAuth": [] } ]
  */
);
router.use( '/charges', chargeRouter
  /*
  #swagger.tags = ['Charges']
  #swagger.security = [ { 'SchedulerAuth': [] } ]
  */
);
router.use( '/docks', dockRouter
  /*
  #swagger.tags = ['Docks']
  #swagger.security = [ { 'EmployeeAuth': [] } ]
  #swagger.responses[401] = {
    description: 'Unauthorized - Employee authentication required'
  }
  #swagger.responses[403] = {
    description: 'Forbidden - Insufficient credentials'
  }
  */
);
router.use( '/employees', employeeRouter );
router.use( '/rentals', rentalRouter );
router.use( '/stations', stationRouter );
router.use( '/specs', specRouter );

export default router;
