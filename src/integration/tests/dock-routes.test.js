import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../../express/app.js';
import DockAdmission from '../../model/models/dock-admission.js';
import DockRemoval from '../../model/models/dock-removal.js';
import Dock from '../../model/models/dock.js';
import Employee from '../../model/models/employee.js';
import Station from '../../model/models/station.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import { PRECONDITION_FAILED_ERROR } from '../../model/shared/enum/error-types.js';
import { createDock, createEmployee, createStation } from '../data-factory.js';
import { operatorToken } from '../tokens.js';
import truncateAllTables from '../truncate-tables.js';

const headers = { authorization: `Bearer ${operatorToken}` };

describe('/api/docks', () => {
  describe('/', () => {
    const path = '/api/docks';

    describe('GET', () => {
      const method = 'get';

      describe('200', () => {
        const docks = [createDock(), createDock()];

        beforeAll(async () => {
          await truncateAllTables();
          await Dock.bulkCreate(docks);
        });

        const testCases = [
          {
            description: 'Records found',
            expectedResBody: expect.arrayContaining(
              docks.map(dock =>
                expect.objectContaining({
                  ...dock,
                  status: dockStatus.OPERATIONAL,
                })
              )
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

      describe('200', () => {
        beforeAll(truncateAllTables);

        const dock = createDock();

        const testCases = [
          {
            description: 'Record created',
            reqBody: dock,
            expectedResBody: expect.objectContaining({
              ...dock,
              status: dockStatus.OPERATIONAL,
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

            const persistedData = await Dock.findOne({
              where: { dockSerial: reqBody.dockSerial },
            });

            expect(persistedData).toStrictEqual(expectedResBody);
          }
        );
      });
    });
  });

  describe('/:id', () => {
    const path = id => `/api/docks/${id}`;

    describe('GET', () => {
      const method = 'get';

      describe('200', () => {
        const dock = createDock();

        beforeAll(async () => {
          await truncateAllTables();
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Record found',
            path: path(dock.id),
            expectedResBody: expect.objectContaining({
              ...dock,
              status: dockStatus.OPERATIONAL,
            }),
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

      describe('200', () => {
        const dock = createDock();

        beforeAll(async () => {
          await truncateAllTables();
          await Dock.create(dock);
        });

        const updateData = createDock({
          status: dockStatus.AVAILABLE,
        });

        const testCases = [
          {
            description: 'Record updated',
            path: path(dock.id),
            reqBody: updateData,
            expectedResBody: expect.objectContaining(updateData),
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

            const persistedData = await Dock.findOne({
              where: { dockSerial: reqBody.dockSerial },
              raw: true,
            });

            expect(persistedData).toStrictEqual(expectedResBody);
          }
        );
      });
    });

    describe('DELETE', () => {
      const method = 'delete';

      describe('204', () => {
        const dock = createDock();

        beforeAll(async () => {
          await truncateAllTables();
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Record deleted',
            path: path(dock.id),
            expectedResBody: {},
            expectPersistedData: expect.objectContaining({
              ...dock,
              status: dockStatus.OPERATIONAL,
              deletedAt: expect.any(Date),
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedResBody, expectPersistedData }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.status).toBe(204);
            expect(res.body).toStrictEqual(expectedResBody);

            const persistedData = await Dock.findByPk(dock.id, {
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
    const path = '/api/docks/admission';

    describe('POST', () => {
      const method = 'post';

      describe('412', () => {
        const availableDock = createDock({
          status: dockStatus.AVAILABLE,
        });
        const decommissionedDock = createDock({
          status: dockStatus.DECOMMISSIONED,
        });
        const maintenanceRequestedDock = createDock({
          status: dockStatus.MAINTENANCE_REQUESTED,
        });
        const occupiedDock = createDock({
          status: dockStatus.OCCUPIED,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await Dock.bulkCreate([
            availableDock,
            decommissionedDock,
            maintenanceRequestedDock,
            occupiedDock,
          ]);
        });

        const testCases = [
          {
            description: 'Available dock',
            reqBody: { dockSerial: availableDock.dockSerial },
          },
          {
            description: 'Decommissioned dock',
            reqBody: { dockSerial: decommissionedDock.dockSerial },
          },
          {
            description: 'Maintenace requested dock',
            reqBody: { dockSerial: maintenanceRequestedDock.dockSerial },
          },
          {
            description: 'Occupied dock',
            reqBody: { dockSerial: occupiedDock.dockSerial },
          },
        ];

        test.each(testCases)('$description', async ({ reqBody }) => {
          const res = await request(app)
            [method](path)
            .set(headers)
            .send(reqBody);

          expect(res.body).toStrictEqual({
            errorType: PRECONDITION_FAILED_ERROR,
            errors: expect.arrayContaining([
              'Dock is not OPERATIONAL, UNDER_MAINTENANCE.',
            ]),
          });
          expect(res.status).toBe(412);
        });
      });

      describe('201', () => {
        const station = createStation();
        const operationalDock = createDock({
          status: dockStatus.OPERATIONAL,
        });
        const underMaintenanceDock = createDock({
          status: dockStatus.UNDER_MAINTENANCE,
        });
        const employee = createEmployee('47537987041');

        beforeAll(async () => {
          await truncateAllTables();
          await Station.create(station);
          await Dock.bulkCreate([operationalDock, underMaintenanceDock]);
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Operational dock',
            reqBody: {
              employeeId: employee.id,
              dockSerial: operationalDock.dockSerial,
              stationSerial: station.stationSerial,
            },
            expectedResBody: expect.objectContaining({
              dockId: operationalDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            }),
            expectedRecord: expect.objectContaining({
              dockId: operationalDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            }),
          },
          {
            description: 'Under maintenance dock',
            reqBody: {
              employeeId: employee.id,
              dockSerial: underMaintenanceDock.dockSerial,
              stationSerial: station.stationSerial,
            },
            expectedResBody: expect.objectContaining({
              dockId: underMaintenanceDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            }),
            expectedRecord: expect.objectContaining({
              dockId: underMaintenanceDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody, expectedRecord }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);

            const admissionRecord = await DockAdmission.findOne({
              where: {
                dockId: expectedRecord.sample.dockId,
                employeeId: expectedRecord.sample.employeeId,
              },
              raw: true,
            });

            expect(admissionRecord).toStrictEqual(expectedRecord);
          }
        );
      });
    });
  });

  describe('/removal', () => {
    const path = '/api/docks/removal';

    describe('POST', () => {
      const method = 'post';

      describe('412', () => {
        const occupiedDock = createDock({
          status: dockStatus.OCCUPIED,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await Dock.bulkCreate([occupiedDock]);
        });

        const testCases = [
          {
            description: 'Occupied dock',
            reqBody: { dockSerial: occupiedDock.dockSerial, action: 'REPAIR' },
          },
        ];

        test.each(testCases)('$description', async ({ reqBody }) => {
          const res = await request(app)
            [method](path)
            .set(headers)
            .send(reqBody);

          expect(res.body).toStrictEqual({
            errorType: PRECONDITION_FAILED_ERROR,
            errors: expect.arrayContaining([
              'Dock is not OPERATIONAL, AVAILABLE, MAINTENANCE_REQUESTED, UNDER_MAINTENANCE, DECOMMISSIONED.',
            ]),
          });
          expect(res.status).toBe(412);
        });
      });

      describe('201', () => {
        const station = createStation();
        const availableDock = createDock({
          status: dockStatus.AVAILABLE,
        });
        const decommissionedDock = createDock({
          status: dockStatus.DECOMMISSIONED,
        });
        const maintenanceRequestedDock = createDock({
          status: dockStatus.MAINTENANCE_REQUESTED,
        });
        const operationalDock = createDock({
          status: dockStatus.OPERATIONAL,
        });
        const underMaintenanceDock = createDock({
          status: dockStatus.UNDER_MAINTENANCE,
        });
        const employee = createEmployee('47537987041');

        beforeAll(async () => {
          await truncateAllTables();
          await Station.create(station);
          await Dock.bulkCreate([
            availableDock,
            decommissionedDock,
            maintenanceRequestedDock,
            operationalDock,
            underMaintenanceDock,
          ]);
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Available dock',
            reqBody: {
              employeeId: employee.id,
              dockSerial: availableDock.dockSerial,
              stationSerial: station.stationSerial,
              action: 'REPAIR',
            },
            expectedResBody: expect.objectContaining({
              dockId: availableDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            }),
            expectedRecord: expect.objectContaining({
              dockId: availableDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            }),
          },
          {
            description: 'Decommissioned dock',
            reqBody: {
              employeeId: employee.id,
              dockSerial: decommissionedDock.dockSerial,
              stationSerial: station.stationSerial,
              action: 'RETIRE',
            },
            expectedResBody: expect.objectContaining({
              dockId: decommissionedDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            }),
            expectedRecord: expect.objectContaining({
              dockId: decommissionedDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            }),
          },
          {
            description: 'Maintenance requested dock',
            reqBody: {
              employeeId: employee.id,
              dockSerial: maintenanceRequestedDock.dockSerial,
              stationSerial: station.stationSerial,
              action: 'REPAIR',
            },
            expectedResBody: expect.objectContaining({
              dockId: maintenanceRequestedDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            }),
            expectedRecord: expect.objectContaining({
              dockId: maintenanceRequestedDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            }),
          },
          {
            description: 'Operational dock',
            reqBody: {
              employeeId: employee.id,
              dockSerial: operationalDock.dockSerial,
              stationSerial: station.stationSerial,
              action: 'RETIRE',
            },
            expectedResBody: expect.objectContaining({
              dockId: operationalDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            }),
            expectedRecord: expect.objectContaining({
              dockId: operationalDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            }),
          },
          {
            description: 'Under maintenance dock',
            reqBody: {
              employeeId: employee.id,
              dockSerial: underMaintenanceDock.dockSerial,
              stationSerial: station.stationSerial,
              action: 'REPAIR',
            },
            expectedResBody: expect.objectContaining({
              dockId: underMaintenanceDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(String),
            }),
            expectedRecord: expect.objectContaining({
              dockId: underMaintenanceDock.id,
              employeeId: employee.id,
              requestedAt: expect.any(Date),
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody, expectedRecord }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);

            const removalRecord = await DockRemoval.findOne({
              where: {
                dockId: expectedRecord.sample.dockId,
                employeeId: expectedRecord.sample.employeeId,
              },
              raw: true,
            });

            expect(removalRecord).toStrictEqual(expectedRecord);
          }
        );
      });
    });
  });
});
