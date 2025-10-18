import express from 'express';
import { bikerAuthMiddleware } from '../auth-middleware.js';
import { rentalController } from '../controller-instances.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/return' ], bikerAuthMiddleware );

// Protected routes
router.route( '/' )
  .post( rentalController.createRecord );

router.route( '/return' )
  .post( rentalController.registerReturn );

export default router;
