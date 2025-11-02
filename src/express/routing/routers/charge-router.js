import express from 'express';
import { chargeController } from '../controller-instances.js';
import { schedulerAuthMiddleware } from '../middlewares/auth-middleware.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/late-fees' ], schedulerAuthMiddleware );

// Protected routes
router.route( '/late-fees' )
  .post(
    /*
    #swagger.summary = "Charge late fees"
    #swagger.description = "Tries to charge late fees (Scheduler auth required)"
    #swagger.responses[204] = {
      description: "Operation complete - No content"
    }
    */
    chargeController.chargeLateFees
  );

export default router;
