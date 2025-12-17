import express from 'express';
import {
  dockAdmissionController,
  dockController,
  dockRemovalController
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

// Protected routes
router.route( '/' )
  .get(
    /*
    #swagger.summary = 'Get all docks'
    #swagger.description = 'Retrieve a list of all docks (Employee access required)'
    #swagger.responses[200] = {
      description: 'Successfully retrieved dock list',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Dock' }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Docks not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            notFoundError: { $ref: '#/components/examples/NotFoundError' }
          }
        }
      }
    }
    */
    dockController.listRecords
  )
  .post(
    /*
    #swagger.summary = 'Create a dock'
    #swagger.description = 'Create a new dock (Employee access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewDock' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Dock created successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Dock' }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            BadRequestError: { $ref: '#/components/examples/BadRequestError' }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: 'Conflict - Dock cannot be created (e.g., conflicting serial)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            uniqueConstraintError: { $ref: '#/components/examples/UniqueConstraintError' }
          }
        }
      }
    }
    */
    dockController.createRecord
  );

router.route( '/:id' )
  .get(
    /*
    #swagger.summary = 'Get dock by ID'
    #swagger.description = 'Retrieve a specific dock by its ID (Employee access required)'
    #swagger.responses[200] = {
      description: 'Successfully retrieved dock',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Dock' }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Dock not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            notFoundError: { $ref: '#/components/examples/NotFoundError' }
          }
        }
      }
    }
    */
    dockController.getRecord
  )
  .put(
    /*
    #swagger.summary = 'Update dock'
    #swagger.description = 'Update a dock (Employee access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateDock' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Dock updated successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Dock' }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            BadRequestError: { $ref: '#/components/examples/BadRequestError' }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Dock not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            notFoundError: { $ref: '#/components/examples/NotFoundError' }
          }
        }
      }
    }
    */
    dockController.updateRecord
  )
  .delete(
    /*
    #swagger.summary = 'Delete dock'
    #swagger.description = 'Delete a dock (Employee access required)'
    #swagger.responses[204] = {
      description: 'Dock deleted successfully - No content'
    }
    #swagger.responses[404] = {
      description: 'Dock not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            notFoundError: { $ref: '#/components/examples/NotFoundError' }
          }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Dock cannot be deleted (e.g., dock has an invalid status)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
    */
    dockController.deleteRecord
  );

router.route( '/admission' )
  .post(
    /*
    #swagger.summary = 'Admit dock to dock'
    #swagger.description = 'Admit a dock to a dock (Operator access required)'
    #swagger.security = [ { 'OperatorAuth': [] } ]
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewDockAdmission' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Dock admitted successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/DockAdmission' }
        }
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized - Operator authentication required'
    }
    #swagger.responses[404] = {
      description: 'Equipment not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            notFoundError: { $ref: '#/components/examples/NotFoundError' }
          }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Dock cannot be admitted (e.g., dock has an invalid status)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
    */
    dockAdmissionController.createRecord
  );

router.route( '/removal' )
  .post(
    /*
    #swagger.summary = 'Remove dock from dock'
    #swagger.description = 'Remove a dock from a dock (Operator access required)'
    #swagger.security = [ { 'OperatorAuth': [] } ]
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewDockRemoval' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Dock removed successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/DockRemoval' }
        }
      }
    }
    #swagger.responses[401] = {
      description: 'Unauthorized - Operator authentication required'
    }
    #swagger.responses[404] = {
      description: 'Equipment not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            notFoundError: { $ref: '#/components/examples/NotFoundError' }
          }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Dock cannot be removed (e.g., dock has an invalid status)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
    */
    dockRemovalController.createRecord
  );

export default router;
