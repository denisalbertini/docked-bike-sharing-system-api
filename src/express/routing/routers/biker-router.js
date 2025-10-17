import express from 'express';
import { bikerAuthMiddleware } from '../auth-middleware.js';
import { bikerController } from '../controller-instances.js';

// Router
const router = express.Router();

// Public routes
router.route( '/' )
  .post( bikerController.createRecord );

router.route( '/:id/confirm' )
  .get( bikerController.confirmEmail );

router.route( '/login' )
  .post( bikerController.login );

// Auth middlewares
router.use( [ '/:id' ], bikerAuthMiddleware );

// Protected routes
router.route( '/:id' )
  .put( bikerController.updateRecord );

router.route( '/:id/credit-cards' )
  .put( bikerController.changeCreditCard );

export default router;
