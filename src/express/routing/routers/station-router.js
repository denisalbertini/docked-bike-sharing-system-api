import express from 'express';
import { stationController } from '../controller-instances.js';
import { employeeAuthMiddleware } from '../middlewares/auth-middleware.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], employeeAuthMiddleware );

// Protected routes
router.route( '/' )
  .get(
    /*
    #swagger.summary = 'Get all stations'
    #swagger.description = 'Retrieve a list of all stations (Employee access required)'
    #swagger.responses[200] = {
      description: 'Successfully retrieved station list',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Station' }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Stations not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            error: { $ref: '#/components/examples/NotFoundError' }
          }
        }
      }
    }
    */
    stationController.listRecords
  )
  .post(
    /*
    #swagger.summary = 'Create a station'
    #swagger.description = 'Create a new station (Employee access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewStation' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Station created successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Station' }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            error: { $ref: '#/components/examples/ValidationError' }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: 'Conflict - Station cannot be created (e.g., conflicting serial)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            error: { $ref: '#/components/examples/UniqueConstraintError' }
          }
        }
      }
    }
    */
    stationController.createRecord
  );

router.route( '/:id' )
  .delete(
    /*
    #swagger.summary = 'Delete station'
    #swagger.description = 'Delete a station (Employee access required)'
    #swagger.responses[204] = {
      description: 'Station deleted successfully - No content'
    }
    #swagger.responses[404] = {
      description: 'Station not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            error: { $ref: '#/components/examples/NotFoundError' }
          }
        }
      }
    }
    #swagger.responses[412] = {
      description: 'Precondition Failed - Station cannot be deleted (e.g., station is operational)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            error: { $ref: '#/components/examples/PreconditionFailedError' }
          }
        }
      }
    }
    */
    stationController.deleteRecord
  );

export default router;
