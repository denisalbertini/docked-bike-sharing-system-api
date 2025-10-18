import express from 'express';
import { adminAuthMiddleware } from '../auth-middleware.js';
import { employeeController } from '../controller-instances.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], adminAuthMiddleware );

// Protected routes
router.route( '/' )
  .get( employeeController.listRecords )
  .post( employeeController.createRecord );

router.route( '/:id' )
  .get( employeeController.getRecord )
  .put( employeeController.updateRecord )
  .delete( employeeController.deleteRecord );

export default router;
