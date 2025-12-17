import express from 'express';
import { rentalController } from '../controller-instances.js';
import { bikerAuthMiddleware } from '../middlewares/auth-middleware.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/return' ], bikerAuthMiddleware );

// Protected routes
router.route( '/' )
  .post(
    /*
    #swagger.summary = 'Create a rental'
    #swagger.description = 'Create a new rental (Biker access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewRental' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Rental created successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Rental' }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Rental cannot be created (e.g., biker is already renting)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
    */
    rentalController.createRecord
  );

router.route( '/return' )
  .post(
    /*
    #swagger.summary = 'Return a bike'
    #swagger.description = 'Return a rented bike (Biker access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/BikeReturn' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Return made successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/FinishedRental' }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Bike cannot be returned (e.g., bike is not rented)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
    */
    rentalController.registerReturn
  );

export default router;
