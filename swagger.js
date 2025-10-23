import swaggerAutogen from 'swagger-autogen';
import bikeStatus from './src/model/shared/enum/bike-status.js';
import bikerStatus from './src/model/shared/enum/biker-status.js';
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
      BikerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
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
      LocalBiker: {
        $creditCard: {
          $id: '99ad9eda-1067-4649-a9f7-ff320bc243e2',
          $creditCardNumber: '2720369125488639',
          $holderName: 'Max Titanium',
          $expirationDate: '06/30',
        },
        $biker: {
          $id: 'ca944d61-3b44-4676-8064-f4a0311d4e41',
          $cpf: '20528178083',
          $name: 'Ramon Dino',
          $birthDate: '2000-06-15',
          $email: 'email@address.com',
          $password:
            '$2b$12$9sT7Qa8vFc2x.Ym3hDpZeu5rV1wKk8qLbN4jS6zM5tC8vB3nA7pP',
          $status: bikerStatus.PENDING,
          $creditCardId: '99ad9eda-1067-4649-a9f7-ff320bc243e2',
        },
      },
      NewLocalBiker: {
        $creditCard: {
          $creditCardNumber: '2720369125488639',
          $holderName: 'Max Titanium',
          $expirationDate: '06/30',
          $cvv: '523',
        },
        $biker: {
          $cpf: '20528178083',
          $name: 'Ramon Dino',
          $birthDate: '2000-06-15',
          $email: 'email@address.com',
          $password: 'secret',
          $confirmationPassword: 'secret',
        },
      },
      UpdateLocalBiker: {
        $biker: {
          name: 'Ramon Dino',
          birthDate: '2000-06-15',
          email: 'email@address.com',
          password: 'secret',
          confirmationPassword: 'secret',
        },
      },
      UpdatedLocalBiker: {
        $biker: {
          $id: 'ca944d61-3b44-4676-8064-f4a0311d4e41',
          $cpf: '20528178083',
          $name: 'Ramon Dino',
          $birthDate: '2000-06-15',
          $email: 'email@address.com',
          $password:
            '$2b$12$9sT7Qa8vFc2x.Ym3hDpZeu5rV1wKk8qLbN4jS6zM5tC8vB3nA7pP',
          $status: bikerStatus.ACTIVE,
          $creditCardId: '99ad9eda-1067-4649-a9f7-ff320bc243e2',
        },
      },
      ForeignerBiker: {
        $creditCard: {
          $id: 'f1cce713-7ee5-429d-97e2-ff64681dd11e',
          $creditCardNumber: '340103324294850',
          $holderName: 'Raw Supplements',
          $expirationDate: '06/30',
        },
        $biker: {
          $id: 'e2417de5-78a3-43fc-9d01-f1d453fbaf67',
          $cpf: null,
          $name: 'Chris Bumstead',
          $birthDate: '2000-06-15',
          $email: 'email@address.com',
          $password:
            '$2b$12$9sT7Qa8vFc2x.Ym3hDpZeu5rV1wKk8qLbN4jS6zM5tC8vB3nA7pP',
          $status: bikerStatus.PENDING,
          $creditCardId: 'f1cce713-7ee5-429d-97e2-ff64681dd11e',
        },
        $passport: {
          $id: '604b613f-265d-42bc-a31a-d8888435d692',
          $passportNumber: 'P123456AA',
          $expirationDate: '2030-06-15',
          $countryCode: 'CAN',
          $bikerId: 'e2417de5-78a3-43fc-9d01-f1d453fbaf67',
        },
      },
      NewForeignerBiker: {
        $creditCard: {
          $creditCardNumber: '340103324294850',
          $holderName: 'Raw Supplements',
          $expirationDate: '06/30',
          $cvv: '609',
        },
        $biker: {
          $name: 'Chris Bumstead',
          $birthDate: '2000-06-15',
          $email: 'email@address.com',
          $password: 'secret',
          $confirmationPassword: 'secret',
        },
        $passport: {
          $passportNumber: 'P123456AA',
          $expirationDate: '2030-06-15',
          $countryCode: 'CAN',
        },
      },
      UpdateForeignerBiker: {
        $biker: {
          name: 'Chris Bumstead',
          birthDate: '2000-06-15',
          email: 'email@address.com',
          password: 'secret',
          confirmationPassword: 'secret',
        },
        passport: {
          $passportNumber: 'P123456AA',
          $expirationDate: '2030-06-15',
          $countryCode: 'CAN',
        },
      },
      UpdatedForeignerBiker: {
        $biker: {
          $id: 'e2417de5-78a3-43fc-9d01-f1d453fbaf67',
          $cpf: null,
          $name: 'Chris Bumstead',
          $birthDate: '2000-06-15',
          $email: 'email@address.com',
          $password:
            '$2b$12$9sT7Qa8vFc2x.Ym3hDpZeu5rV1wKk8qLbN4jS6zM5tC8vB3nA7pP',
          $status: bikerStatus.ACTIVE,
          $creditCardId: 'f1cce713-7ee5-429d-97e2-ff64681dd11e',
        },
        $passport: {
          $id: '604b613f-265d-42bc-a31a-d8888435d692',
          $passportNumber: 'P123456AA',
          $expirationDate: '2030-06-15',
          $countryCode: 'CAN',
          $bikerId: 'e2417de5-78a3-43fc-9d01-f1d453fbaf67',
        },
      },
      NewCreditCard: {
        $creditCardNumber: '4716269544487406',
        $holderName: 'Scrooge McDuck',
        $expirationDate: '06/30',
        $cvv: '286',
      },
      BikerLogin: {
        $email: 'email@address.com',
        $password: 'secret',
      },
      JWT: {
        $token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
      },
      Error: {
        $errorType: { '@enum': Object.values(errorTypes) },
        $errors: ['Error message 1', 'Error message 2'],
      },
    },
    examples: {
      UnauthorizedError: {
        value: {
          errorType: errorTypes.AUTHENTICATION_ERROR,
          errors: ['Incorrect crdentials.'],
        },
      },
      ForbiddenError: {
        value: {
          errorType: errorTypes.FORBIDDEN_ERROR,
          errors: ['Invalid request.'],
        },
      },
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
