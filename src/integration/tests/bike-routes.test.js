import { faker } from '@faker-js/faker';
import { beforeAll, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../express/app.js';
import BikeAdmission from '../../model/models/bike-admission.js';
import BikeRemoval from '../../model/models/bike-removal.js';
import Bike from '../../model/models/bike.js';
import Dock from '../../model/models/dock.js';
import Employee from '../../model/models/employee.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import employeeRole from '../../model/shared/enum/employee-role.js';
import {
  NOT_FOUND_ERROR,
  PRECONDITION_FAILED_ERROR,
  UNIQUE_CONSTRAINT_ERROR,
  VALIDATION_ERROR,
} from '../../model/shared/enum/error-types.js';
import { createBike, createDock, createEmployee } from '../data-factory.js';
import { operatorToken } from '../tokens.js';
import truncateAllTables from '../truncate-tables.js';

const headers = { authorization: `Bearer ${operatorToken}` };

describe('/api/bikes', () => {
  describe('/', () => {
    const path = '/api/bikes';

    describe('GET', () => {
      const method = 'get';

      describe('404', () => {
        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'No records found',
            expectedErrors: ['No entries found.'],
          },
        ];

        test.each(testCases)('$description', async ({ expectedErrors }) => {
          const res = await request(app)[method](path).set(headers);

          expect(res.status).toBe(404);
          expect(res.body).toStrictEqual({
            errorType: NOT_FOUND_ERROR,
            errors: expectedErrors,
          });
        });
      });

      describe('200', () => {
        const bikes = [createBike('BI-001'), createBike('BI-002')];

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.bulkCreate(bikes);
        });

        const testCases = [
          {
            description: 'Records founds',
            expectedResBody: bikes.map(b => ({
              ...b,
              status: bikeStatus.NEW,
              deletedAt: null,
            })),
          },
        ];

        test.each(testCases)('$description', async ({ expectedResBody }) => {
          const res = await request(app)[method](path).set(headers);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual(expectedResBody);
        });
      });
    });

    describe('POST', () => {
      const method = 'post';

      describe('409', () => {
        const conflictingBike = createBike('BI-001');

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.create(conflictingBike);
        });

        const newBike = createBike('BI-001');

        const testCases = [
          {
            description: 'Conflicting serial number',
            reqBody: newBike,
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "bike_bike_serial_key"',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(409);
            expect(res.body).toStrictEqual({
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('400', () => {
        const invalidBike = createBike('abc', {
          brand: 'a'.repeat(101),
          model: '',
          manufactureYear: 'abc',
          status: 'abc',
        });
        const nullBike = createBike(null, {
          brand: null,
          model: null,
          manufactureYear: null,
          status: null,
        });

        const testCases = [
          {
            description: 'Invalid values',
            reqBody: invalidBike,
            expectedErrors: [
              'Validation is on bikeSerial failed',
              'Validation len on brand failed',
              'Validation len on model failed',
              'Validation is on manufactureYear failed',
              'Validation isIn on status failed',
            ],
          },
          {
            description: 'Null values',
            reqBody: nullBike,
            expectedErrors: [
              'Bike.bikeSerial cannot be null',
              'Bike.brand cannot be null',
              'Bike.model cannot be null',
              'Bike.manufactureYear cannot be null',
              'Bike.status cannot be null',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({
              errorType: VALIDATION_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('200', () => {
        const bike = createBike('BI-001');

        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'Record created',
            reqBody: bike,
            expectedResBody: expect.objectContaining({
              ...bike,
              status: bikeStatus.NEW,
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(201);
            expect(res.body).toStrictEqual(expectedResBody);

            const persistedData = await Bike.findOne({
              where: { id: reqBody.id },
              raw: true,
            });

            expect(persistedData).toStrictEqual(expectedResBody);
          }
        );
      });
    });
  });

  describe('/:id', () => {
    const path = id => `/api/bikes/${id}`;

    describe('GET', () => {
      const method = 'get';

      describe('404', () => {
        const testCases = [
          {
            description: 'No record found',
            path: path(faker.string.uuid()),
            expectedErrors: ['No entry found.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedErrors }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.body).toStrictEqual({
              errorType: NOT_FOUND_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(404);
          }
        );
      });

      describe('200', () => {
        const bike = createBike('BI-001');

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.create(bike);
        });

        const testCases = [
          {
            description: 'Populated database',
            path: path(bike.id),
            expectedResBody: {
              ...bike,
              status: bikeStatus.NEW,
              deletedAt: null,
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedResBody }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });
    });

    describe('PUT', () => {
      const method = 'put';

      describe('409', () => {
        const conflictingBike = createBike('BI-001');
        const bikeToUpdate = createBike('BI-002', { id: faker.string.uuid() });

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.bulkCreate([conflictingBike, bikeToUpdate]);
        });

        const testCases = [
          {
            description: 'Conflicting serial number',
            path: path(bikeToUpdate.id),
            reqBody: conflictingBike,
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "bike_pkey"',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(409);
            expect(res.body).toStrictEqual({
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('404', () => {
        const testCases = [
          {
            description: 'No record found',
            path: path(faker.string.uuid()),
            expectedErrors: ['Entry does not exist.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedErrors }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.status).toBe(404);
            expect(res.body).toStrictEqual({
              errorType: NOT_FOUND_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('200', () => {
        const bike = createBike('BI-001');

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.create(bike);
        });

        const updateData = createBike('BI-002', {
          status: bikeStatus.AVAILABLE,
        });

        const testCases = [
          {
            description: 'Record updated',
            path: path(bike.id),
            reqBody: { ...updateData, deletedAt: null },
            expectedResBody: { ...updateData, deletedAt: null },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual(expectedResBody);

            const persistedData = await Bike.findOne({
              where: { bikeSerial: reqBody.bikeSerial },
              raw: true,
            });

            expect(persistedData).toStrictEqual(expectedResBody);
          }
        );
      });
    });

    describe('DELETE', () => {
      const method = 'delete';

      describe('412', () => {
        const bike = createBike('BI-001');
        const dock = createDock('DO-001', { bikeId: bike.id });

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.create(bike);
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Preconditions failed',
            path: path(bike.id),
            expectedErrors: ['Bike is not RETIRED.', 'Bike is docked.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedErrors }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.status).toBe(412);
            expect(res.body).toStrictEqual({
              errorType: PRECONDITION_FAILED_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('404', () => {
        const testCases = [
          {
            description: 'No record found',
            path: path(faker.string.uuid()),
            expectedErrors: ['No entry found.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedErrors }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.body).toStrictEqual({
              errorType: NOT_FOUND_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(404);
          }
        );
      });

      describe('204', () => {
        const bike = createBike('BI-001', { status: bikeStatus.RETIRED });

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.bulkCreate([bike]);
        });

        const testCases = [
          {
            description: 'Record deleted',
            path: path(bike.id),
            expectPersistedData: {
              ...bike,
              deletedAt: expect.any(Date),
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectPersistedData }) => {
            const res = await request(app)[method](path).set(headers);

            const persistedData = await Bike.findByPk(bike.id, {
              raw: true,
              paranoid: false,
            });

            expect(res.status).toBe(204);
            expect(res.body).toStrictEqual({});
            expect(persistedData).toStrictEqual(expectPersistedData);
          }
        );
      });
    });
  });

  describe('/admission', () => {
    const path = '/api/bikes/admission';

    describe('POST', () => {
      const method = 'post';

      describe('412', () => {
        const bike = createBike('BI-001', { status: bikeStatus.AVAILABLE });
        const dock = createDock('DO-001');

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.bulkCreate([bike]);
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Preconditions failed',
            reqBody: {
              bikeSerial: bike.bikeSerial,
              dockSerial: dock.dockSerial,
            },
            expectedErrors: [
              'Bike is not NEW, UNDER_MAINTENANCE.',
              'Dock is not AVAILABLE.',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(412);
            expect(res.body).toStrictEqual({
              errorType: PRECONDITION_FAILED_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('404', () => {
        const testCases = [
          {
            description: 'Invalid values',
            reqBody: {
              bikeSerial: 'abc',
              dockSerial: 'abc',
            },
            expectedErrors: ['Bike not found.', 'Dock not found.'],
          },
          {
            description: 'Null values',
            reqBody: {
              bikeSerial: null,
              dockSerial: null,
            },
            expectedErrors: ['Bike not found.', 'Dock not found.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(404);
            expect(res.body).toStrictEqual({
              errorType: NOT_FOUND_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('200', () => {
        const newBike = createBike('BI-001', { status: bikeStatus.NEW });
        const underMaintenanceBike = createBike('BI-002', {
          status: bikeStatus.UNDER_MAINTENANCE,
        });
        const dock = createDock('DO-001', { status: dockStatus.AVAILABLE });

        beforeEach(async () => {
          await truncateAllTables();
          await Bike.bulkCreate([newBike, underMaintenanceBike]);
          await Dock.bulkCreate([dock]);
        });

        const testCases = [
          {
            description: 'New bike',
            bike: newBike,
            reqBody: {
              bikeSerial: newBike.bikeSerial,
              dockSerial: dock.dockSerial,
            },
            expectedResBody: {
              bikeId: newBike.id,
              dockId: dock.id,
              requestedAt: expect.any(String),
            },
            expectedAdmissionRecord: {
              id: expect.any(String),
              bikeId: newBike.id,
              dockId: dock.id,
              requestedAt: expect.any(Date),
            },
            expectedBikeRecord: {
              ...newBike,
              status: bikeStatus.AVAILABLE,
              deletedAt: null,
            },
            expectedDockRecord: {
              ...dock,
              status: dockStatus.OCCUPIED,
              deletedAt: null,
            },
          },
          {
            description: 'Under maintenance bike',
            bike: underMaintenanceBike,
            reqBody: {
              bikeSerial: underMaintenanceBike.bikeSerial,
              dockSerial: dock.dockSerial,
            },
            expectedResBody: {
              bikeId: underMaintenanceBike.id,
              dockId: dock.id,
              requestedAt: expect.any(String),
            },
            expectedAdmissionRecord: {
              id: expect.any(String),
              bikeId: underMaintenanceBike.id,
              dockId: dock.id,
              requestedAt: expect.any(Date),
            },
            expectedBikeRecord: {
              ...underMaintenanceBike,
              status: bikeStatus.AVAILABLE,
              deletedAt: null,
            },
            expectedDockRecord: {
              ...dock,
              status: dockStatus.OCCUPIED,
              deletedAt: null,
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            reqBody,
            expectedResBody,
            expectedAdmissionRecord,
            expectedBikeRecord,
            expectedDockRecord,
          }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            const admissionRecord = await BikeAdmission.findOne({
              where: {
                bikeId: expectedResBody.bikeId,
                dockId: expectedResBody.dockId,
              },
              raw: true,
            });
            const bikeRecord = await Bike.findByPk(expectedResBody.bikeId, {
              raw: true,
            });
            const dockRecord = await Dock.findByPk(expectedResBody.dockId, {
              raw: true,
            });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);
            expect(admissionRecord).toStrictEqual(expectedAdmissionRecord);
            expect(bikeRecord).toStrictEqual(expectedBikeRecord);
            expect(dockRecord).toStrictEqual(expectedDockRecord);
          }
        );
      });
    });
  });

  describe('/removal', () => {
    const path = '/api/bikes/removal';

    describe('POST', () => {
      const method = 'post';

      describe('412', () => {
        const bike = createBike('BI-001');
        const dock = createDock('DO-001');

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.create(bike);
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Preconditions failed',
            reqBody: {
              bikeSerial: bike.bikeSerial,
              dockSerial: dock.dockSerial,
            },
            expectedErrors: [
              'Bike is not MAINTENANCE_REQUESTED.',
              'Dock is not OCCUPIED.',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(412);
            expect(res.body).toStrictEqual({
              errorType: PRECONDITION_FAILED_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('404', () => {
        const testCases = [
          {
            description: 'Invalid values',
            reqBody: {
              bikeSerial: 'abc',
              dockSerial: 'abc',
            },
            expectedErrors: ['Bike not found.', 'Dock not found.'],
          },
          {
            description: 'Null values',
            reqBody: {
              bikeSerial: null,
              dockSerial: null,
            },
            expectedErrors: ['Bike not found.', 'Dock not found.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(404);
            expect(res.body).toStrictEqual({
              errorType: NOT_FOUND_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('200', () => {
        const employee = createEmployee(
          'EM-001',
          '29596382047',
          employeeRole.OPERATOR
        );
        const maintenanceRequestedBike = createBike('BI-002', {
          status: bikeStatus.MAINTENANCE_REQUESTED,
        });
        const dock = createDock('DO-001', { status: dockStatus.OCCUPIED });

        beforeEach(async () => {
          await truncateAllTables();
          await Employee.create(employee);
          await Bike.bulkCreate([maintenanceRequestedBike]);
          await Dock.bulkCreate([dock]);
        });

        const testCases = [
          {
            description: 'Repair',
            bike: maintenanceRequestedBike,
            reqBody: {
              employeeId: employee.id,
              bikeSerial: maintenanceRequestedBike.bikeSerial,
              dockSerial: dock.dockSerial,
              action: 'REPAIR',
            },
            expectedResBody: {
              bikeId: maintenanceRequestedBike.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            },
            expectedRemovalRecord: {
              id: expect.any(String),
              bikeId: maintenanceRequestedBike.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            },
            expectedBikeRecord: {
              ...maintenanceRequestedBike,
              status: bikeStatus.UNDER_MAINTENANCE,
              deletedAt: null,
            },
            expectedDockRecord: {
              ...dock,
              status: dockStatus.AVAILABLE,
              deletedAt: null,
            },
          },
          {
            description: 'Retire',
            bike: maintenanceRequestedBike,
            reqBody: {
              employeeId: employee.id,
              bikeSerial: maintenanceRequestedBike.bikeSerial,
              dockSerial: dock.dockSerial,
              action: 'RETIRE',
            },
            expectedResBody: {
              bikeId: maintenanceRequestedBike.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            },
            expectedRemovalRecord: {
              id: expect.any(String),
              bikeId: maintenanceRequestedBike.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            },
            expectedBikeRecord: {
              ...maintenanceRequestedBike,
              status: bikeStatus.RETIRED,
              deletedAt: null,
            },
            expectedDockRecord: {
              ...dock,
              status: dockStatus.AVAILABLE,
              deletedAt: null,
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            reqBody,
            expectedResBody,
            expectedRemovalRecord,
            expectedBikeRecord,
            expectedDockRecord,
          }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            const admissionRecord = await BikeRemoval.findOne({
              where: {
                bikeId: expectedResBody.bikeId,
                employeeId: expectedResBody.employeeId,
              },
              raw: true,
            });
            const bikeRecord = await Bike.findByPk(expectedResBody.bikeId, {
              raw: true,
            });
            const dockRecord = await Dock.findOne({
              where: { dockSerial: reqBody.dockSerial },
              raw: true,
            });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);
            expect(admissionRecord).toStrictEqual(expectedRemovalRecord);
            expect(bikeRecord).toStrictEqual(expectedBikeRecord);
            expect(dockRecord).toStrictEqual(expectedDockRecord);
          }
        );
      });
    });
  });
});
