import swaggerAutogen from 'swagger-autogen';
import bikeStatus from './src/model/shared/enum/bike-status.js';
import * as errorTypes from './src/model/shared/enum/error-types.js';

const doc = {
  info: {
    version: '1.0.0',
    title: 'Docked Bike Sharing System API',
    description: '',
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [
    { name: 'Bikes', description: 'Bike management endpoints' },
    { name: 'Bikers', description: 'Biker management endpoints' },
    { name: 'Charges', description: 'Charging operations' },
    { name: 'Docks', description: 'Dock management endpoints' },
    { name: 'Employees', description: 'Employee management endpoints' },
    { name: 'Rentals', description: 'Rental operations' },
    { name: 'Stations', description: 'Station management endpoints' },
  ],
  components: {
    securitySchemes: {
      EmployeeAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      OperatorAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Bike: {
        $id: '51235fe8-76fe-47d0-bcb7-49760f09eff5',
        $bikeSerial: 'BI-001',
        $brand: 'Caloi',
        $model: 'Velox',
        $manufactureYear: 2020,
        $status: {
          '@enum': Object.values(bikeStatus),
          example: bikeStatus.NEW,
        },
      },
      NewBike: {
        $bikeSerial: 'BI-001',
        $brand: 'Caloi',
        $model: 'Velox',
        $manufactureYear: 2020,
      },
      UpdateBike: {
        brand: 'Caloi',
        model: 'Velox',
      },
      BikeAdmission: {
        $id: 'c9ebf37a-d07c-468d-a643-214eee5ff51e',
        $requestedAt: new Date('2025-06-15').toString(),
        $bikeId: '8b665731-39a9-4817-9f15-ec4d5e9ce3dc',
        $dockId: '227c0110-4b12-45ad-ba6a-785a494fb6e0',
      },
      NewBikeAdmission: {
        $bikeSerial: 'BI-001',
        $dockSerial: 'DO-001',
      },
      BikeRemoval: {
        $id: 'c9ebf37a-d07c-468d-a643-214eee5ff51e',
        $requestedAt: new Date('2025-06-15').toString(),
        $bikeId: '8b665731-39a9-4817-9f15-ec4d5e9ce3dc',
        $employeeId: '227c0110-4b12-45ad-ba6a-785a494fb6e0',
      },
      NewBikeRemoval: {
        $employeeId: '227c0110-4b12-45ad-ba6a-785a494fb6e0',
        $bikeSerial: 'BI-001',
        $dockSerial: 'DO-001',
        $action: {
          '@enum': ['REPAIR', 'RETIRE'],
          example: 'REPAIR',
        },
      },
      Error: {
        $errorType: { '@enum': Object.values(errorTypes) },
        $errors: ['Error message 1', 'Error message 2'],
      },
    },
    examples: {
      NotFoundError: {
        value: {
          errorType: errorTypes.NOT_FOUND_ERROR,
          errors: ['Records not found.'],
        },
      },
      ValidationError: {
        value: {
          errorType: errorTypes.VALIDATION_ERROR,
          errors: [
            'Validation is on entity.field failed.',
            'Validation len on entity.anotherField failed.',
          ],
        },
      },
      UniqueConstraintError: {
        value: {
          errorType: errorTypes.UNIQUE_CONSTRAINT_ERROR,
          errors: [
            'duplicating key value violates unique constraint "entity_field_key"',
          ],
        },
      },
      PreconditionFailedError: {
        value: {
          errorType: errorTypes.PRECONDITION_FAILED_ERROR,
          errors: ['Instance is not STATUS'],
        },
      },
    },
  },
};

const outputFile = './swagger-output.json';
const routes = ['./src/express/app.js'];

swaggerAutogen({ openapi: '3.0.4' })(outputFile, routes, doc);
