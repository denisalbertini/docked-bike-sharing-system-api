import express from 'express';
import {
  employeeAuthMiddleware, 
  operatorAuthMiddleware
} from '../auth-middleware.js';
import {
  bikeController, 
  bikeAdmissionController, 
  bikeRemovalController
} from '../controller-instances.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], employeeAuthMiddleware );
router.use( [ '/admission', '/removal' ], operatorAuthMiddleware );

// Routes
router.route( '/' )
  .get( bikeController.listRecords )
  .post( bikeController.createRecord );

router.route( '/:id' )
  .get( bikeController.getRecord )
  .put( bikeController.updateRecord )
  .delete( bikeController.deleteRecord );

router.route( '/admission' )
  .post( bikeAdmissionController.createRecord );

router.route( '/removal' )
  .post( bikeRemovalController.createRecord );

export default router;
