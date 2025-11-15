import fs from 'fs';
import swaggerAutogen from 'swagger-autogen';
import bikeStatus from './src/model/shared/enum/bike-status.js';
import bikerStatus from './src/model/shared/enum/biker-status.js';
import dockStatus from './src/model/shared/enum/dock-status.js';
import employeeRole from './src/model/shared/enum/employee-role.js';
import * as errorTypes from './src/model/shared/enum/error-types.js';

const doc = {
  info: {
    version: '1.0.0',
    title: 'Docked Bike Sharing System API',
    description: '',
  },
  servers: [{ url: 'localhost:3000', description: 'Local development server' }],
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
      SchedulerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      AdminAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    '@schemas': {
      Bike: {
        type: 'object',
        required: [
          'id',
          'bikeSerial',
          'brand',
          'model',
          'manufactureYear',
          'status',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          bikeSerial: { type: 'string', example: 'BI-001' },
          brand: { type: 'string', example: 'Caloi' },
          model: { type: 'string', example: 'Velox' },
          manufactureYear: { type: 'integer', example: 2020 },
          status: {
            type: 'string',
            enum: Object.values(bikeStatus),
            example: bikeStatus.NEW,
          },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
        },
        additionalProperties: false,
      },
      NewBike: {
        type: 'object',
        required: ['bikeSerial', 'brand', 'model', 'manufactureYear'],
        properties: {
          bikeSerial: { type: 'string', example: 'BI-001' },
          brand: { type: 'string', example: 'Caloi' },
          model: { type: 'string', example: 'Velox' },
          manufactureYear: { type: 'integer', example: 2020 },
        },
        additionalProperties: false,
      },
      UpdateBike: {
        type: 'object',
        properties: {
          brand: { type: 'string', example: 'Caloi' },
          model: { type: 'string', example: 'Velox' },
        },
        additionalProperties: false,
      },
      BikeAdmission: {
        type: 'object',
        required: ['id', 'requestedAt', 'bikeId', 'dockId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          requestedAt: { type: 'string', format: 'date-time' },
          bikeId: { type: 'string', format: 'uuid' },
          dockId: { type: 'string', format: 'uuid' },
        },
        additionalProperties: false,
      },
      NewBikeAdmission: {
        type: 'object',
        required: ['bikeSerial', 'dockSerial'],
        properties: {
          bikeSerial: { type: 'string', example: 'BI-001' },
          dockSerial: { type: 'string', example: 'DO-001' },
        },
        additionalProperties: false,
      },
      BikeRemoval: {
        type: 'object',
        required: ['id', 'requestedAt', 'bikeId', 'employeeId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          requestedAt: { type: 'string', format: 'date-time' },
          bikeId: { type: 'string', format: 'uuid' },
          employeeId: { type: 'string', format: 'uuid' },
        },
        additionalProperties: false,
      },
      NewBikeRemoval: {
        type: 'object',
        required: ['employeeId', 'bikeSerial', 'dockSerial', 'action'],
        properties: {
          employeeId: { type: 'string', format: 'uuid' },
          bikeSerial: { type: 'string', example: 'BI-001' },
          dockSerial: { type: 'string', example: 'DO-001' },
          action: {
            type: 'string',
            enum: ['REPAIR', 'RETIRE'],
            example: 'REPAIR',
          },
        },
        additionalProperties: false,
      },
      LocalBiker: {
        type: 'object',
        required: ['creditCard', 'biker'],
        properties: {
          creditCard: {
            type: 'object',
            required: [
              'id',
              'creditCardNumber',
              'holderName',
              'creditCardExpirationDate',
            ],
            properties: {
              id: { type: 'string', format: 'uuid' },
              creditCardNumber: { type: 'string', example: '2720369125488639' },
              holderName: { type: 'string', example: 'Max Titanium' },
              creditCardExpirationDate: { type: 'string', example: '06/30' },
            },
            additionalProperties: false,
          },
          biker: {
            type: 'object',
            required: [
              'id',
              'cpf',
              'name',
              'birthDate',
              'email',
              'password',
              'status',
              'creditCardId',
            ],
            properties: {
              id: { type: 'string', format: 'uuid' },
              cpf: { type: 'string', example: '20528178083' },
              name: { type: 'string', example: 'Ramon Dino' },
              birthDate: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string' },
              status: {
                type: 'string',
                enum: Object.values(bikerStatus),
                example: bikerStatus.PENDING,
              },
              creditCardId: { type: 'string', format: 'uuid' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      NewLocalBiker: {
        type: 'object',
        required: ['creditCard', 'biker'],
        properties: {
          creditCard: {
            type: 'object',
            required: [
              'creditCardNumber',
              'holderName',
              'creditCardExpirationDate',
              'cvv',
            ],
            properties: {
              creditCardNumber: { type: 'string', example: '2720369125488639' },
              holderName: { type: 'string', example: 'Max Titanium' },
              creditCardExpirationDate: { type: 'string', example: '06/30' },
              cvv: { type: 'string', example: '523' },
            },
            additionalProperties: false,
          },
          biker: {
            type: 'object',
            required: [
              'cpf',
              'name',
              'birthDate',
              'email',
              'password',
              'confirmationPassword',
            ],
            properties: {
              cpf: { type: 'string', example: '20528178083' },
              name: { type: 'string', example: 'Ramon Dino' },
              birthDate: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', example: 'secret' },
              confirmationPassword: { type: 'string', example: 'secret' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      UpdateLocalBiker: {
        type: 'object',
        required: ['biker'],
        properties: {
          biker: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Ramon Dino' },
              birthDate: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', example: 'secret' },
              confirmationPassword: { type: 'string', example: 'secret' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      UpdatedLocalBiker: {
        type: 'object',
        required: ['biker'],
        properties: {
          biker: {
            type: 'object',
            required: [
              'id',
              'cpf',
              'name',
              'birthDate',
              'email',
              'password',
              'status',
              'creditCardId',
            ],
            properties: {
              id: { type: 'string', format: 'uuid' },
              cpf: { type: 'string', example: '20528178083' },
              name: { type: 'string', example: 'Ramon Dino' },
              birthDate: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string' },
              status: {
                type: 'string',
                enum: Object.values(bikerStatus),
                example: bikerStatus.ACTIVE,
              },
              creditCardId: { type: 'string', format: 'uuid' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      ForeignerBiker: {
        type: 'object',
        required: ['creditCard', 'biker', 'passport'],
        properties: {
          creditCard: {
            type: 'object',
            required: [
              'id',
              'creditCardNumber',
              'holderName',
              'creditCardExpirationDate',
            ],
            properties: {
              id: { type: 'string', format: 'uuid' },
              creditCardNumber: { type: 'string', example: '340103324294850' },
              holderName: { type: 'string', example: 'Raw Supplements' },
              creditCardExpirationDate: { type: 'string', example: '06/30' },
            },
            additionalProperties: false,
          },
          biker: {
            type: 'object',
            required: [
              'id',
              'cpf',
              'name',
              'birthDate',
              'email',
              'password',
              'status',
              'creditCardId',
            ],
            properties: {
              id: { type: 'string', format: 'uuid' },
              cpf: { type: 'string', nullable: true },
              name: { type: 'string', example: 'Chris Bumstead' },
              birthDate: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string' },
              status: {
                type: 'string',
                enum: Object.values(bikerStatus),
                example: bikerStatus.PENDING,
              },
              creditCardId: { type: 'string', format: 'uuid' },
            },
            additionalProperties: false,
          },
          passport: {
            type: 'object',
            required: [
              'id',
              'passportNumber',
              'passportExpirationDate',
              'countryCode',
              'bikerId',
            ],
            properties: {
              id: { type: 'string', format: 'uuid' },
              passportNumber: { type: 'string', example: 'P123456AA' },
              passportExpirationDate: { type: 'string', format: 'date' },
              countryCode: { type: 'string', example: 'CAN' },
              bikerId: { type: 'string', format: 'uuid' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      NewForeignerBiker: {
        type: 'object',
        required: ['creditCard', 'biker', 'passport'],
        properties: {
          creditCard: {
            type: 'object',
            required: [
              'creditCardNumber',
              'holderName',
              'creditCardExpirationDate',
              'cvv',
            ],
            properties: {
              creditCardNumber: { type: 'string', example: '340103324294850' },
              holderName: { type: 'string', example: 'Raw Supplements' },
              creditCardExpirationDate: { type: 'string', example: '06/30' },
              cvv: { type: 'string', example: '609' },
            },
            additionalProperties: false,
          },
          biker: {
            type: 'object',
            required: [
              'name',
              'birthDate',
              'email',
              'password',
              'confirmationPassword',
            ],
            properties: {
              name: { type: 'string', example: 'Chris Bumstead' },
              birthDate: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', example: 'secret' },
              confirmationPassword: { type: 'string', example: 'secret' },
            },
            additionalProperties: false,
          },
          passport: {
            type: 'object',
            required: [
              'passportNumber',
              'passportExpirationDate',
              'countryCode',
            ],
            properties: {
              passportNumber: { type: 'string', example: 'P123456AA' },
              passportExpirationDate: { type: 'string', format: 'date' },
              countryCode: { type: 'string', example: 'CAN' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      UpdateForeignerBiker: {
        type: 'object',
        required: ['biker', 'passport'],
        properties: {
          biker: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Chris Bumstead' },
              birthDate: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', example: 'secret' },
              confirmationPassword: { type: 'string', example: 'secret' },
            },
            additionalProperties: false,
          },
          passport: {
            type: 'object',
            properties: {
              passportNumber: { type: 'string', example: 'P123456AA' },
              passportExpirationDate: { type: 'string', format: 'date' },
              countryCode: { type: 'string', example: 'CAN' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      UpdatedForeignerBiker: {
        type: 'object',
        required: ['biker', 'passport'],
        properties: {
          biker: {
            type: 'object',
            required: [
              'id',
              'cpf',
              'name',
              'birthDate',
              'email',
              'password',
              'status',
              'creditCardId',
            ],
            properties: {
              id: { type: 'string', format: 'uuid' },
              cpf: { type: 'string', nullable: true },
              name: { type: 'string', example: 'Chris Bumstead' },
              birthDate: { type: 'string', format: 'date' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string' },
              status: {
                type: 'string',
                enum: Object.values(bikerStatus),
                example: bikerStatus.ACTIVE,
              },
              creditCardId: { type: 'string', format: 'uuid' },
            },
            additionalProperties: false,
          },
          passport: {
            type: 'object',
            required: [
              'id',
              'passportNumber',
              'passportExpirationDate',
              'countryCode',
              'bikerId',
            ],
            properties: {
              id: { type: 'string', format: 'uuid' },
              passportNumber: { type: 'string', example: 'P123456AA' },
              passportExpirationDate: { type: 'string', format: 'date' },
              countryCode: { type: 'string', example: 'CAN' },
              bikerId: { type: 'string', format: 'uuid' },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      NewCreditCard: {
        type: 'object',
        required: [
          'creditCardNumber',
          'holderName',
          'creditCardExpirationDate',
          'cvv',
        ],
        properties: {
          creditCardNumber: { type: 'string', example: '4716269544487406' },
          holderName: { type: 'string', example: 'Scrooge McDuck' },
          creditCardExpirationDate: { type: 'string', example: '06/30' },
          cvv: { type: 'string', example: '286' },
        },
        additionalProperties: false,
      },
      BikerLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', example: 'secret' },
        },
        additionalProperties: false,
      },
      Dock: {
        type: 'object',
        required: [
          'id',
          'dockSerial',
          'model',
          'manufactureDate',
          'status',
          'stationId',
          'bikeId',
          'deletedAt',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          dockSerial: { type: 'string', example: 'DO-001' },
          model: { type: 'string', example: 'Bike Dock' },
          manufactureDate: { type: 'string', format: 'date' },
          status: {
            type: 'string',
            enum: Object.values(dockStatus),
            example: dockStatus.OPERATIONAL,
          },
          stationId: { type: 'string', format: 'uuid', nullable: true },
          bikeId: { type: 'string', format: 'uuid', nullable: true },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
        },
        additionalProperties: false,
      },
      NewDock: {
        type: 'object',
        required: ['dockSerial', 'model', 'manufactureDate'],
        properties: {
          dockSerial: { type: 'string', example: 'D0-001' },
          model: { type: 'string', example: 'Bike Dock' },
          manufactureDate: { type: 'string', format: 'date' },
        },
        additionalProperties: false,
      },
      UpdateDock: {
        type: 'object',
        properties: {
          model: { type: 'string', example: 'Bike Dock' },
          manufactureDate: { type: 'string', format: 'date' },
        },
        additionalProperties: false,
      },
      DockAdmission: {
        type: 'object',
        required: ['id', 'requestedAt', 'dockId', 'employeeId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          requestedAt: { type: 'string', format: 'date-time' },
          dockId: { type: 'string', format: 'uuid' },
          employeeId: { type: 'string', format: 'uuid' },
        },
        additionalProperties: false,
      },
      NewDockAdmission: {
        type: 'object',
        required: ['employeeId', 'dockSerial', 'stationSerial'],
        properties: {
          employeeId: { type: 'string', format: 'uuid' },
          dockSerial: { type: 'string', example: 'DO-001' },
          stationSerial: { type: 'string', example: 'ST-001' },
        },
        additionalProperties: false,
      },
      DockRemoval: {
        type: 'object',
        required: ['id', 'requestedAt', 'dockId', 'employeeId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          requestedAt: { type: 'string', format: 'date-time' },
          dockId: { type: 'string', format: 'uuid' },
          employeeId: { type: 'string', format: 'uuid' },
        },
        additionalProperties: false,
      },
      NewDockRemoval: {
        type: 'object',
        required: ['employeeId', 'dockSerial', 'action'],
        properties: {
          employeeId: { type: 'string', format: 'uuid' },
          dockSerial: { type: 'string', example: 'DO-001' },
          action: {
            type: 'string',
            enum: ['REPAIR', 'RETIRE'],
            example: 'REPAIR',
          },
        },
        additionalProperties: false,
      },
      Employee: {
        type: 'object',
        required: [
          'id',
          'registration',
          'cpf',
          'name',
          'birthDate',
          'role',
          'deletedAt',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          registration: { type: 'string', example: 'EM-001' },
          cpf: { type: 'string', example: '29914469000' },
          name: { type: 'string', example: 'Carlos Sainz' },
          birthDate: { type: 'string', format: 'date' },
          role: {
            type: 'string',
            enum: Object.values(employeeRole),
            example: employeeRole.OPERATOR,
          },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
        },
        additionalProperties: false,
      },
      NewEmployee: {
        type: 'object',
        required: ['registration', 'cpf', 'name', 'birthDate', 'role'],
        properties: {
          registration: { type: 'string', example: 'EM-001' },
          cpf: { type: 'string', example: '29914469000' },
          name: { type: 'string', example: 'Carlos Sainz' },
          birthDate: { type: 'string', format: 'date' },
          role: {
            type: 'string',
            enum: Object.values(employeeRole),
            example: employeeRole.OPERATOR,
          },
        },
        additionalProperties: false,
      },
      UpdateEmployee: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Carlos Sainz' },
          birthDate: { type: 'string', format: 'date' },
          role: {
            type: 'string',
            enum: Object.values(employeeRole),
            example: employeeRole.OPERATOR,
          },
        },
        additionalProperties: false,
      },
      Rental: {
        type: 'object',
        required: [
          'id',
          'startedAt',
          'finishedAt',
          'bikerId',
          'bikeId',
          'rentedFromDockId',
          'returnedToDockId',
          'initialChargeId',
          'extraChargeId',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          startedAt: {
            type: 'string',
            example: new Date('2025-06-15').toString(),
          },
          finishedAt: {
            type: 'string',
            example: new Date('2025-06-15').toString(),
            nullable: true,
          },
          bikerId: { type: 'string', format: 'uuid' },
          bikeId: { type: 'string', format: 'uuid' },
          rentedFromDockId: { type: 'string', format: 'uuid' },
          returnedToDockId: { type: 'string', format: 'uuid', nullable: true },
          initialChargeId: { type: 'string', format: 'uuid' },
          extraChargeId: { type: 'string', format: 'uuid', nullable: true },
        },
        additionalProperties: false,
      },
      NewRental: {
        type: 'object',
        required: ['bikerId', 'bikeSerial', 'dockSerial'],
        properties: {
          bikerId: { type: 'string', format: 'uuid' },
          bikeSerial: { type: 'string', example: 'BI-001' },
          dockSerial: { type: 'string', example: 'DO-001' },
        },
        additionalProperties: false,
      },
      BikeReturn: {
        type: 'object',
        required: ['bikeSerial', 'dockSerial'],
        properties: {
          bikeSerial: { type: 'string', example: 'BI-001' },
          dockSerial: { type: 'string', example: 'DO-001' },
        },
        additionalProperties: false,
      },
      FinishedRental: {
        type: 'object',
        required: [
          'id',
          'startedAt',
          'finishedAt',
          'bikerId',
          'bikeId',
          'rentedFromDockId',
          'returnedToDockId',
          'initialChargeId',
          'extraChargeId',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          startedAt: {
            type: 'string',
            example: new Date('2025-06-15').toString(),
          },
          finishedAt: {
            type: 'string',
            example: new Date('2025-06-15').toString(),
          },
          bikerId: { type: 'string', format: 'uuid' },
          bikeId: { type: 'string', format: 'uuid' },
          rentedFromDockId: { type: 'string', format: 'uuid' },
          returnedToDockId: { type: 'string', format: 'uuid' },
          initialChargeId: { type: 'string', format: 'uuid' },
          extraChargeId: { type: 'string', format: 'uuid', nullable: true },
        },
        additionalProperties: false,
      },
      Station: {
        type: 'object',
        required: ['id', 'stationSerial', 'name', 'location'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          stationSerial: { type: 'string', example: 'ST-001' },
          name: { type: 'string', example: 'Bike Sampa' },
          location: { type: 'string', example: 'Av. Paulista' },
        },
        additionalProperties: false,
      },
      NewStation: {
        type: 'object',
        required: ['stationSerial', 'name', 'location'],
        properties: {
          stationSerial: { type: 'string', example: 'ST-001' },
          name: { type: 'string', example: 'Bike Sampa' },
          location: { type: 'string', example: 'Av. Paulista' },
        },
        additionalProperties: false,
      },
      JWT: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
        additionalProperties: false,
      },
      Error: {
        type: 'object',
        required: ['errorType', 'errors'],
        properties: {
          errorType: { type: 'string', enum: Object.values(errorTypes) },
          errors: {
            type: 'array',
            items: { type: 'string' },
            example: ['Error message 1', 'Error message 2'],
          },
        },
        additionalProperties: false,
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

await swaggerAutogen({ openapi: '3.0.4' })(outputFile, routes, doc);

/*
  A solution to byspass trailing slashes in paths because of
  strict swagger-autogen path generation and
  strict express-openapi-validator paths validation
*/
const swaggerDoc = JSON.parse(fs.readFileSync('./swagger-output.json'));

const normalizedPaths = {};
Object.keys(swaggerDoc.paths).forEach(path => {
  const normalizedPath =
    path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  normalizedPaths[normalizedPath] = swaggerDoc.paths[path];
});

swaggerDoc.paths = normalizedPaths;
fs.writeFileSync('./swagger-output.json', JSON.stringify(swaggerDoc, null, 2));
