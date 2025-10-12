import express from 'express';
import { adminAuthMiddleware } from '../auth-middleware.js';
import { employeeController } from '../controller-instances.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], adminAuthMiddleware );

// Routes
router.route( '/' )
  .get( employeeController.listRecords );

router.route( '/:id' )
  .get( employeeController.getRecord )
  .put( employeeController.updateRecord )
  .delete( employeeController.deleteRecord );

router.route( '/login' )
  .post( employeeController.login );

export default router;
