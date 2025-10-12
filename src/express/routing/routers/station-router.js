import express from 'express';
import { employeeAuthMiddleware } from '../auth-middleware.js';
import { stationController } from '../controller-instances.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], employeeAuthMiddleware );

// Routes
router.route( '/' )
  .get( stationController.listRecords )
  .post( stationController.createRecord );

router.route( '/:id' )
  .put( stationController.updateRecord )
  .delete( stationController.deleteRecord );

export default router;
