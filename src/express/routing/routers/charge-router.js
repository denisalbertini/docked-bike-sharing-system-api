import express from 'express';
import { chargeController } from '../controller-instances.js';

// Router
const router = express.Router();

// Routes
router.route( '/late-fees' )
  .post( chargeController.chargeLateFees );

export default router;
