import express from 'express';
import { employeeController } from '../controller-instances.js';
import { adminAuthMiddleware } from '../middlewares/auth-middleware.js';

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], adminAuthMiddleware );

// Protected routes
router.route( '/' )
  .get(
    /*
    #swagger.summary = 'Get all employees'
    #swagger.description = 'Retrieve a list of all employees (Admin access required)'
    #swagger.responses[200] = {
      description: 'Successfully retrieved employee list',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Employee' }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Employees not found',
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
    employeeController.listRecords
  )
  .post(
    /*
    #swagger.summary = 'Create a employee'
    #swagger.description = 'Create a new employee (Admin access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/NewEmployee' }
        }
      }
    }
    #swagger.responses[201] = {
      description: 'Employee created successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Employee' }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            error: { $ref: '#/components/examples/BadRequestError' }
          }
        }
      }
    }
    #swagger.responses[409] = {
      description: 'Conflict - Employee cannot be created (e.g., conflicting registration)',
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
    employeeController.createRecord
  );

router.route( '/:id' )
  .get(
    /*
    #swagger.summary = 'Get employee by ID'
    #swagger.description = 'Retrieve a specific employee by its ID (Admin access required)'
    #swagger.responses[200] = {
      description: 'Successfully retrieved employee',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Employee' }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Employee not found',
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
    employeeController.getRecord
  )
  .put(
    /*
    #swagger.summary = 'Update employee'
    #swagger.description = 'Update a employee (Admin access required)'
    #swagger.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateEmployee' }
        }
      }
    }
    #swagger.responses[200] = {
      description: 'Employee updated successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Employee' }
        }
      }
    }
    #swagger.responses[400] = {
      description: 'Bad Request - Invalid input data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
          examples: {
            error: { $ref: '#/components/examples/BadRequestError' }
          }
        }
      }
    }
    #swagger.responses[404] = {
      description: 'Employee not found',
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
    employeeController.updateRecord
  )
  .delete(
    /*
    #swagger.summary = 'Delete employee'
    #swagger.description = 'Delete a employee (Admin access required)'
    #swagger.responses[204] = {
      description: 'Employee deleted successfully - No content'
    }
    #swagger.responses[404] = {
      description: 'Employee not found',
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
    employeeController.deleteRecord
  );

export default router;
