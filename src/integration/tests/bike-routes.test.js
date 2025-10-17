import app from '../../express/app.js';
import request from 'supertest';
import { beforeAll, expect, jest } from '@jest/globals';
import { bikeData, dockData, employeeData } from '../test-data.js';
import { operatorToken } from '../tokens.js';
import truncateAllTables from '../truncate-tables.js';
import {
  NOT_FOUND_ERROR,
  PRECONDITION_FAILED_ERROR,
  UNIQUE_CONSTRAINT_ERROR,
  VALIDATION_ERROR,
} from '../../model/shared/enum/error-types.js';
import Bike from '../../model/models/bike.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import Dock from '../../model/models/dock.js';
import BikeAdmission from '../../model/models/bike-admission.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import BikeRemoval from '../../model/models/bike-removal.js';
import Employee from '../../model/models/employee.js';

const fakeDate = new Date('2025-06-15T00:00:00');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(fakeDate);
});

afterAll(() => {
  jest.useRealTimers();
});

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
            description: 'Empty database',
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['No entries found.'],
            },
          },
        ];

        test.each(testCases)('$description', async ({ expectedResBody }) => {
          const res = await request(app)[method](path).set(headers);

          expect(res.status).toBe(404);
          expect(res.body).toStrictEqual(expectedResBody);
        });
      });

      describe('200', () => {
        beforeAll(() => Bike.bulkCreate(bikeData));

        const testCases = [
          {
            description: 'Populated database',
            expectedResBody: expect.arrayContaining(
              bikeData.map(bike => expect.objectContaining(bike))
            ),
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
        const testCases = [
          {
            description: 'Existing serial number',
            reqBody: { ...bikeData[0], id: undefined },
            expectedResBody: { errorType: UNIQUE_CONSTRAINT_ERROR, errors: [] },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(409);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('400', () => {
        const testCases = [
          {
            description: 'Invalid data format',
            reqBody: {
              bikeSerial: 'abc',
              brand: 'a'.repeat(101),
              model: '',
              manufactureYear: 'abc',
              status: 'abc',
            },
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Validation is on bikeSerial failed',
                'Validation len on brand failed',
                'Validation len on model failed',
                'Validation is on manufactureYear failed',
                'Validation isIn on status failed',
              ],
            },
          },
          {
            description: 'Null values',
            reqBody: {
              bikeSerial: null,
              brand: null,
              model: null,
              manufactureYear: null,
              status: null,
            },
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Bike.bikeSerial cannot be null',
                'Bike.brand cannot be null',
                'Bike.model cannot be null',
                'Bike.manufactureYear cannot be null',
                'Bike.status cannot be null',
              ],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('200', () => {
        const validData = {
          bikeSerial: 'BI-999',
          brand: 'abc',
          model: 'abc',
          manufactureYear: 2000,
        };

        const testCases = [
          {
            description: 'Record created',
            reqBody: validData,
            expectedResBody: expect.objectContaining({
              ...validData,
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
              where: { serialNumber: reqBody.serialNumber },
            });

            expect(persistedData).toStrictEqual(expectedResBody);
          }
        );
      });
    });
  });

  describe('/:id', () => {
    const path = `/api/bikes/${bikeData[0].id}`;

    describe('GET', () => {
      const method = 'get';

      describe('404', () => {
        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'Empty database',
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['No entry found.'],
            },
          },
        ];

        test.each(testCases)('$description', async ({ expectedResBody }) => {
          const res = await request(app)[method](path).set(headers);

          expect(res.status).toBe(404);
          expect(res.body).toStrictEqual(expectedResBody);
        });
      });

      describe('200', () => {
        beforeAll(() => Bike.create(bikeData[0]));

        const testCases = [
          {
            description: 'Populated database',
            expectedResBody: expect.objectContaining(bikeData[0]),
          },
        ];

        test.each(testCases)('$description', async ({ expectedResBody }) => {
          const res = await request(app)[method](path).set(headers);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual(expectedResBody);
        });
      });
    });

    describe('PUT', () => {
      const method = 'put';

      describe('409', () => {
        beforeAll(() => Bike.create(bikeData[1]));

        const testCases = [
          {
            description: 'Existing serial number',
            reqBody: {
              bikeSerial: 'BI-002',
              brand: 'abcd',
              model: 'abcd',
              manufactureYear: 2001,
            },
            expectedResBody: { errorType: UNIQUE_CONSTRAINT_ERROR, errors: [] },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(409);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('404', () => {
        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'Empty database',
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['Entry does not exist.'],
            },
          },
        ];

        test.each(testCases)('$description', async ({ expectedResBody }) => {
          const res = await request(app)[method](path).set(headers);

          expect(res.status).toBe(404);
          expect(res.body).toStrictEqual(expectedResBody);
        });
      });

      describe('200', () => {
        const bikeToUpdate = bikeData[0];

        beforeAll(() => Bike.create(bikeToUpdate));

        const validData = {
          bikeSerial: 'BI-999',
          brand: 'abcd',
          model: 'abcd',
          manufactureYear: 2001,
        };

        const testCases = [
          {
            description: 'Record updated',
            reqBody: { id: bikeToUpdate.id, ...validData },
            expectedResBody: expect.objectContaining({
              id: bikeToUpdate.id,
              ...validData,
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

            expect(res.status).toBe(200);
            expect(res.body).toStrictEqual(expectedResBody);

            const persistedData = await Bike.findOne({
              where: { serialNumber: reqBody.serialNumber },
            });

            expect(persistedData).toStrictEqual(expectedResBody);
          }
        );
      });
    });

    describe('DELETE', () => {
      const method = 'delete';

      describe('412', () => {
        const occupiedDock = dockData[3];

        beforeAll(() => Dock.create(occupiedDock));

        const testCases = [
          {
            description: 'Invalid status',
            path,
            expectedResBody: {
              errorType: PRECONDITION_FAILED_ERROR,
              errors: ['Bike does not match preconditions.', 'Bike is docked.'],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedResBody }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.status).toBe(412);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('404', () => {
        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'Empty database',
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['No entry found.'],
            },
          },
        ];

        test.each(testCases)('$description', async ({ expectedResBody }) => {
          const res = await request(app)[method](path).set(headers);

          expect(res.status).toBe(404);
          expect(res.body).toStrictEqual(expectedResBody);
        });
      });

      describe('204', () => {
        const bike = bikeData[4];

        beforeAll(() => Bike.create(bike));

        const testCases = [
          {
            description: 'Record deleted',
            path: `/api/bikes/${bike.id}`,
            expectedResBody: {},
            expectPersistedData: {
              ...bike,
              deletedAt: expect.objectContaining(fakeDate),
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedResBody, expectPersistedData }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.status).toBe(204);
            expect(res.body).toStrictEqual(expectedResBody);

            const persistedData = await Bike.findByPk(bike.id, {
              raw: true,
              paranoid: false,
            });

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
        const bike = bikeData[0];
        const dock = dockData[1];

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.create(bike);
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Preconditions failed',
            reqBody: {
              bikeSerialNumber: bike.bikeSerial,
              dockSerialNumber: dock.dockSerial,
            },
            expectedResBody: {
              errorType: PRECONDITION_FAILED_ERROR,
              errors: [
                'Bike is not NEW, UNDER MAINTENANCE.',
                'Dock is not AVAILABLE.',
              ],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(412);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('404', () => {
        const testCases = [
          {
            description: 'Invalid values',
            reqBody: {
              bikeSerialNumber: 'abc',
              dockSerialNumber: 'abc',
            },
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['Bike not found.', 'Dock not found.'],
            },
          },
          {
            description: 'Null values',
            reqBody: {
              bikeSerialNumber: null,
              dockSerialNumber: null,
            },
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['Bike not found.', 'Dock not found.'],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(404);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('200', () => {
        const newBike = bikeData[2];
        const underMaintenanceBike = bikeData[5];
        const dock = dockData[0];

        beforeEach(async () => {
          await truncateAllTables();
          await Bike.bulkCreate([newBike, underMaintenanceBike]);
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'New bike',
            bike: newBike,
            reqBody: {
              bikeSerialNumber: newBike.serialNumber,
              dockSerialNumber: dock.serialNumber,
            },
            expectedResBody: expect.objectContaining({
              bikeId: newBike.id,
              dockId: dock.id,
              requestedAt: fakeDate.toString(),
            }),
            expectedAdmissionRecord: expect.objectContaining({
              bikeId: newBike.id,
              dockId: dock.id,
              requestedAt: expect.objectContaining(fakeDate),
            }),
            expectedBikeRecord: expect.objectContaining({
              ...newBike,
              status: bikeStatus.AVAILABLE,
            }),
            expectedDockRecord: expect.objectContaining({
              ...dock,
              status: dockStatus.OCCUPIED,
            }),
          },
          {
            description: 'Under maintenance bike',
            bike: underMaintenanceBike,
            reqBody: {
              bikeSerialNumber: underMaintenanceBike.serialNumber,
              dockSerialNumber: dock.serialNumber,
              requestedAt: expect.objectContaining(fakeDate),
            },
            expectedResBody: expect.objectContaining({
              bikeId: underMaintenanceBike.id,
              dockId: dock.id,
              requestedAt: fakeDate.toString(),
            }),
            expectedAdmissionRecord: expect.objectContaining({
              bikeId: underMaintenanceBike.id,
              dockId: dock.id,
              requestedAt: expect.objectContaining(fakeDate),
            }),
            expectedBikeRecord: expect.objectContaining({
              ...underMaintenanceBike,
              status: bikeStatus.AVAILABLE,
            }),
            expectedDockRecord: expect.objectContaining({
              ...dock,
              status: dockStatus.OCCUPIED,
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            reqBody,
            expectedResBody,
            bike,
            expectedAdmissionRecord,
            expectedBikeRecord,
            expectedDockRecord,
          }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(201);
            expect(res.body).toStrictEqual(expectedResBody);

            const admissionRecord = await BikeAdmission.findOne({
              where: {
                bikeId: bike.id,
                dockId: dock.id,
              },
              raw: true,
            });
            const bikeRecord = await Bike.findByPk(bike.id, { raw: true });
            const dockRecord = await Dock.findByPk(dock.id, { raw: true });

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
        const bike = bikeData[0];
        const dock = dockData[0];

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.create(bike);
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Preconditions failed',
            reqBody: {
              bikeSerialNumber: bike.serialNumber,
              dockSerialNumber: dock.serialNumber,
            },
            expectedResBody: {
              errorType: PRECONDITION_FAILED_ERROR,
              errors: [
                'Bike is not MAINTENANCE REQUESTED.',
                'Dock is not OCCUPIED.',
              ],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(412);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('404', () => {
        const testCases = [
          {
            description: 'Invalid values',
            reqBody: {
              bikeSerialNumber: 'abc',
              dockSerialNumber: 'abc',
            },
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['Bike not found.', 'Dock not found.'],
            },
          },
          {
            description: 'Null values',
            reqBody: {
              bikeSerialNumber: null,
              dockSerialNumber: null,
            },
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['Bike not found.', 'Dock not found.'],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(404);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('200', () => {
        const maintenanceRequestedBike = bikeData[1];
        const dock = dockData[4];
        const employee = employeeData[0];

        beforeEach(async () => {
          await truncateAllTables();
          await Bike.create(maintenanceRequestedBike);
          await Dock.create(dock);
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Repair',
            bike: maintenanceRequestedBike,
            reqBody: {
              bikeSerialNumber: maintenanceRequestedBike.serialNumber,
              dockSerialNumber: dock.serialNumber,
              employeeId: employee.id,
              action: 'REPAIR',
            },
            expectedResBody: expect.objectContaining({
              bikeId: maintenanceRequestedBike.id,
              employeeId: employee.id,
              requestedAt: fakeDate.toString(),
            }),
            expectedRemovalRecord: expect.objectContaining({
              bikeId: maintenanceRequestedBike.id,
              employeeId: employee.id,
              requestedAt: expect.objectContaining(fakeDate),
            }),
            expectedBikeRecord: expect.objectContaining({
              ...maintenanceRequestedBike,
              status: bikeStatus.UNDER_MAINTENANCE,
            }),
            expectedDockRecord: expect.objectContaining({
              ...dock,
              status: dockStatus.AVAILABLE,
            }),
          },
          {
            description: 'Retire',
            bike: maintenanceRequestedBike,
            reqBody: {
              bikeSerialNumber: maintenanceRequestedBike.serialNumber,
              dockSerialNumber: dock.serialNumber,
              employeeId: employee.id,
              action: 'RETIRE',
            },
            expectedResBody: expect.objectContaining({
              bikeId: maintenanceRequestedBike.id,
              employeeId: employee.id,
              requestedAt: fakeDate.toString(),
            }),
            expectedRemovalRecord: expect.objectContaining({
              bikeId: maintenanceRequestedBike.id,
              employeeId: employee.id,
              requestedAt: expect.objectContaining(fakeDate),
            }),
            expectedBikeRecord: expect.objectContaining({
              ...maintenanceRequestedBike,
              status: bikeStatus.RETIRED,
            }),
            expectedDockRecord: expect.objectContaining({
              ...dock,
              status: dockStatus.AVAILABLE,
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            reqBody,
            expectedResBody,
            bike,
            expectedRemovalRecord,
            expectedBikeRecord,
            expectedDockRecord,
          }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.status).toBe(201);
            expect(res.body).toStrictEqual(expectedResBody);

            const removalRecord = await BikeRemoval.findOne({
              where: {
                bikeId: bike.id,
                employeeId: employee.id,
              },
              raw: true,
            });
            const bikeRecord = await Bike.findByPk(bike.id, { raw: true });
            const dockRecord = await Dock.findByPk(dock.id, { raw: true });

            expect(removalRecord).toStrictEqual(expectedRemovalRecord);
            expect(bikeRecord).toStrictEqual(expectedBikeRecord);
            expect(dockRecord).toStrictEqual(expectedDockRecord);
          }
        );
      });
    });
  });
});
