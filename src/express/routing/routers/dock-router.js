import express from 'express';
import {
  employeeAuthMiddleware,
  operatorAuthMiddleware
} from "../auth-middleware.js";
import {
  dockAdmissionController,
  dockController,
  dockRemovalController
} from '../controller-instances.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], employeeAuthMiddleware );
router.use( [ '/admission', '/removal' ], operatorAuthMiddleware );

// Protected routes
router.route( '/' )
  .get( dockController.listRecords )
  .post( dockController.createRecord );

router.route( '/:id' )
  .get( dockController.getRecord )
  .put( dockController.updateRecord )
  .delete( dockController.deleteRecord );

router.route( '/admission' )
  .post( dockAdmissionController.createRecord );

router.route( '/removal' )
  .post( dockRemovalController.createRecord );

export default router;
