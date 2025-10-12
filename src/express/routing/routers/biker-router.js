import express from 'express';
import { bikerAuthMiddleware } from '../auth-middleware.js';
import { bikerController } from '../controller-instances.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/:id', '/:id/credit-card' ], bikerAuthMiddleware );

// Routes
router.route( '/' )
  .post( bikerController.createRecord );

router.route( '/login' )
  .post( bikerController.login );

router.route( '/:id' )
  .put( bikerController.updateRecord );

router.route( '/:id/credit-card' )
  .put( bikerController.changeCreditCard );

export default router;
