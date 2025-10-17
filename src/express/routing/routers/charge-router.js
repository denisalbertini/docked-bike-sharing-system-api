import express from 'express';
import { schedulerAuthMiddleware } from '../auth-middleware.js';
import { chargeController } from '../controller-instances.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/late-fees' ], schedulerAuthMiddleware );

// Protected routes
router.route( '/late-fees' )
  .post( chargeController.chargeLateFees );

export default router;
