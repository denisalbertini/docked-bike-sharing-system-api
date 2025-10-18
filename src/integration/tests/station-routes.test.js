import { faker } from '@faker-js/faker';
import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../../express/app.js';
import Dock from '../../model/models/dock.js';
import Station from '../../model/models/station.js';
import {
  NOT_FOUND_ERROR,
  PRECONDITION_FAILED_ERROR,
  UNIQUE_CONSTRAINT_ERROR,
  VALIDATION_ERROR,
} from '../../model/shared/enum/error-types.js';
import { createDock, createStation } from '../data-factory.js';
import { adminToken } from '../tokens.js';
import truncateAllTables from '../truncate-tables.js';

const headers = { authorization: `Bearer ${adminToken}` };

describe('/api/stations', () => {
  describe('/', () => {
    const path = '/api/stations';

    describe('GET', () => {
      const method = 'get';

      describe('404', () => {
        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'No recods found',
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
        const stations = [createStation('ST-001'), createStation('ST-002')];

        beforeAll(async () => {
          await truncateAllTables();
          await Station.bulkCreate(stations);
        });

        const testCases = [
          {
            description: 'Record found',
            expectedResBody: stations,
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
        const station = createStation('ST-001');

        beforeAll(async () => {
          await truncateAllTables();
          await Station.create(station);
        });

        const newStation = createStation('ST-001');

        const testCases = [
          {
            description: 'Conflicting serial',
            reqBody: newStation,
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "station_station_serial_key"',
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

            expect(res.body).toStrictEqual({
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(409);
          }
        );
      });

      describe('400', () => {
        const invalidStation = createStation('abc', { name: '', location: '' });
        const nullStation = createStation(null, { name: null, location: null });

        const testCases = [
          {
            description: 'Invalid data',
            reqBody: invalidStation,
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Validation is on stationSerial failed',
                'Validation len on name failed',
                'Validation len on location failed',
              ],
            },
          },
          {
            description: 'Null Data',
            reqBody: nullStation,
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Station.stationSerial cannot be null',
                'Station.name cannot be null',
                'Station.location cannot be null',
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
        const station = createStation('ST-001');

        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'Record created',
            reqBody: station,
            expectedResBody: station,
            expectedRecord: station,
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

            const record = await Station.findByPk(reqBody.id, { raw: true });

            expect(record).toStrictEqual(expectedRecord);
          }
        );
      });
    });
  });

  describe('/:id', () => {
    const path = id => `/api/stations/${id}`;

    describe('DELETE', () => {
      const method = 'delete';

      describe('412', () => {
        const station = createStation('ST-001');
        const dock = createDock('DO-001', { stationId: station.id });

        beforeAll(async () => {
          await truncateAllTables();
          await Station.create(station);
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Operating station',
            path: path(station.id),
            expectedErrors: ['There are docks on the station.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedErrors }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.body).toStrictEqual({
              errorType: PRECONDITION_FAILED_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(412);
          }
        );
      });

      describe('404', () => {
        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'No recods found',
            path: path(faker.string.uuid()),
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['Entry does not exist.'],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedResBody }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(404);
          }
        );
      });

      describe('200', () => {
        const station = createStation('ST-001');

        beforeAll(async () => {
          await truncateAllTables();
          await Station.create(station);
        });

        const testCases = [
          {
            description: 'Record found',
            path: path(station.id),
            expectedResBody: {},
            expectedRecord: null,
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedResBody, expectedRecord }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.status).toBe(204);
            expect(res.body).toStrictEqual(expectedResBody);

            const record = await Station.findByPk(station.id, {
              raw: true,
            });

            expect(record).toStrictEqual(expectedRecord);
          }
        );
      });
    });
  });
});
