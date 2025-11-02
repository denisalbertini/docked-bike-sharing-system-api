import express from 'express';
import {
  bikeAdmissionController,
  bikeController,
  bikeRemovalController
} from '../controller-instances.js';
import {
  employeeAuthMiddleware,
  operatorAuthMiddleware
} from '../middlewares/auth-middleware.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], employeeAuthMiddleware );
router.use( [ '/admission', '/removal' ], operatorAuthMiddleware );

// Routes
router.route( '/' )
  .get(
    /*
    #swagger.summary = 'Get all bikes'
    #swagger.description = 'Retrieve a list of all bikes (Employee access required)'
    #swagger.responses[200] = {
      description: 'Successfully retrieved bike list',
      content: {
        "application/json": {
          schema: {
            type: 'array',
            items: { $ref: "#/components/schemas/Bike" }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Bikes not found',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            notFoundError: { $ref: "#/components/examples/NotFoundError" }
          }
        }
      }
    }
    */
    bikeController.listRecords
  )
  .post(
    /*
    #swagger.summary = 'Create a bike'
    #swagger.description = 'Create a new bike (Employee access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/NewBike" }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Bike created successfully',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Bike" }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            validationError: { $ref: "#/components/examples/ValidationError" }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: 'Conflict - Bike cannot be created (e.g., conflicting serial)',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            uniqueConstraintError: { $ref: "#/components/examples/UniqueConstraintError" }
          }
        }
      }
    }
    */
    bikeController.createRecord
  );

router.route( '/:id' )
  .get(
    /*
    #swagger.summary = 'Get bike by ID'
    #swagger.description = 'Retrieve a specific bike by its ID (Employee access required)'
    #swagger.responses[200] = {
      description: 'Successfully retrieved bike',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Bike" }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Bike not found',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            notFoundError: { $ref: "#/components/examples/NotFoundError" }
          }
        }
      }
    }
    */
    bikeController.getRecord
  )
  .put(
    /*
    #swagger.summary = 'Update bike'
    #swagger.description = 'Update a bike (Employee access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/UpdateBike" }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Bike updated successfully',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Bike" }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            validationError: { $ref: "#/components/examples/ValidationError" }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Bike not found',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            notFoundError: { $ref: "#/components/examples/NotFoundError" }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: 'Conflict - Bike cannot be updated (e.g., conflicting serial)',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            uniqueConstraintError: { $ref: "#/components/examples/UniqueConstraintError" }
          }
        }
      }
    }
    */
    bikeController.updateRecord
  )
  .delete(
    /*
    #swagger.summary = 'Delete bike'
    #swagger.description = 'Delete a bike (Employee access required)'
    #swagger.responses[204] = {
      description: 'Bike deleted successfully - No content'
    }
    #swagger.responses[404] = {
      description: 'Bike not found',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            notFoundError: { $ref: "#/components/examples/NotFoundError" }
          }
        }
      }
    }
    #swagger.responses[412] = {
      description: 'Precondition Failed - Bike cannot be deleted (e.g., bike has an invalid status)',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            preconditionFailedError: { $ref: "#/components/examples/PreconditionFailedError" }
          }
        }
      }
    }
    */
    bikeController.deleteRecord
  );

router.route( '/admission' )
  .post(
    /*
    #swagger.summary = 'Admit bike to dock'
    #swagger.description = 'Admit a bike to a dock (Operator access required)'
    #swagger.security = [ { "OperatorAuth": [] } ]
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/NewBikeAdmission" }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Bike admitted successfully',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/BikeAdmission" }
        }
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized - Operator authentication required'
    }
    #swagger.responses[404] = {
      description: 'Equipment not found',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            notFoundError: { $ref: "#/components/examples/NotFoundError" }
          }
        }
      }
    }
    #swagger.responses[412] = {
      description: 'Precondition Failed - Bike cannot be admitted (e.g., bike has an invalid status)',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            preconditionFailedError: { $ref: "#/components/examples/PreconditionFailedError" }
          }
        }
      }
    }
    */
    bikeAdmissionController.createRecord
  );

router.route( '/removal' )
  .post(
    /*
    #swagger.summary = 'Remove bike from dock'
    #swagger.description = 'Remove a bike from a dock (Operator access required)'
    #swagger.security = [ { "OperatorAuth": [] } ]
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/NewBikeRemoval" }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Bike removed successfully',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/BikeRemoval" }
        }
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized - Operator authentication required'
    }
    #swagger.responses[404] = {
      description: 'Equipment not found',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            notFoundError: { $ref: "#/components/examples/NotFoundError" }
          }
        }
      }
    }
    #swagger.responses[412] = {
      description: 'Precondition Failed - Bike cannot be removed (e.g., bike has an invalid status)',
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          examples: {
            preconditionFailedError: { $ref: "#/components/examples/PreconditionFailedError" }
          }
        }
      }
    }
    */
    bikeRemovalController.createRecord
  );

export default router;
