import { faker } from '@faker-js/faker';
import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../../express/app.js';
import Employee from '../../model/models/employee.js';
import employeeRole from '../../model/shared/enum/employee-role.js';
import {
  NOT_FOUND_ERROR,
  VALIDATION_ERROR,
} from '../../model/shared/enum/error-types.js';
import { createEmployee } from '../data-factory.js';
import { adminToken } from '../tokens.js';
import truncateAllTables from '../truncate-tables.js';

const headers = { authorization: `Bearer ${adminToken}` };

describe('/api/employees', () => {
  describe('/', () => {
    const path = '/api/employees';

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
        const admin = createEmployee('04130338056', {
          role: employeeRole.ADMIN,
        });
        const operator = createEmployee('59013719090', {
          role: employeeRole.OPERATOR,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.bulkCreate([admin, operator]);
        });

        const testCases = [
          {
            description: 'Records found',
            expectedResBody: [
              { ...admin, deletedAt: null },
              { ...operator, deletedAt: null },
            ],
          },
        ];

        test.each(testCases)('$description', async ({ expectedResBody }) => {
          const res = await request(app)[method](path).set(headers);

          expect(res.body).toStrictEqual(expectedResBody);
          expect(res.status).toBe(200);
        });
      });
    });

    describe('POST', () => {
      const method = 'post';

      describe('400', () => {
        const employee = createEmployee('abc', {
          registration: 'abc',
          name: '',
          birthDate: '2030-06-15',
        });

        const testCases = [
          {
            description: 'Invalid data',
            reqBody: {
              registration: employee.registration,
              cpf: employee.cpf,
              name: employee.name,
              birthDate: employee.birthDate,
              role: employee.role,
            },
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Validation isValidCpf on cpf failed',
                'Validation isValidBirthDate on birthDate failed',
                'Validation is on registration failed',
                'Validation is on name failed',
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
        const admin = createEmployee('78378763005', {
          role: employeeRole.ADMIN,
        });
        const operator = createEmployee('19194767092', {
          role: employeeRole.OPERATOR,
        });

        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'Admin',
            reqBody: {
              registration: admin.registration,
              cpf: admin.cpf,
              name: admin.name,
              birthDate: admin.birthDate,
              role: admin.role,
            },
            expectedResBody: expect.objectContaining({
              ...admin,
              id: expect.any(String),
              deletedAt: null,
            }),
            expectedRecord: expect.objectContaining({
              ...admin,
              id: expect.any(String),
              deletedAt: null,
            }),
          },
          {
            description: 'Operator',
            reqBody: {
              registration: operator.registration,
              cpf: operator.cpf,
              name: operator.name,
              birthDate: operator.birthDate,
              role: operator.role,
            },
            expectedResBody: expect.objectContaining({
              ...operator,
              id: expect.any(String),
              deletedAt: null,
            }),
            expectedRecord: expect.objectContaining({
              ...operator,
              id: expect.any(String),
              deletedAt: null,
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

            const record = await Employee.findOne({
              where: { cpf: reqBody.cpf },
              raw: true,
            });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);
            expect(record).toStrictEqual(expectedRecord);
          }
        );
      });
    });
  });

  describe('/:id', () => {
    const path = id => `/api/employees/${id}`;

    describe('GET', () => {
      const method = 'get';

      describe('404', () => {
        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'No recods found',
            path: path(faker.string.uuid()),
            expectedResBody: {
              errorType: NOT_FOUND_ERROR,
              errors: ['No entry found.'],
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
        const employee = createEmployee('04130338056');

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Record found',
            path: path(employee.id),
            expectedResBody: expect.objectContaining({
              ...employee,
              deletedAt: null,
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

      describe('400', () => {
        const employee = createEmployee('44493972076');
        const invalidEmployee = createEmployee('abc', {
          name: '',
          birthDate: '2030-06-15',
        });

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Invalid data',
            path: path(employee.id),
            reqBody: {
              name: invalidEmployee.name,
              birthDate: invalidEmployee.birthDate,
            },
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Validation isValidBirthDate on birthDate failed',
                'Validation is on name failed',
              ],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, reqBody, expectedResBody }) => {
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
        const employee = createEmployee('44493972076');
        const update = createEmployee('19194767092');

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Updated',
            path: path(employee.id),
            reqBody: {
              name: update.name,
              birthDate: update.birthDate,
            },
            expectedResBody: expect.objectContaining({
              ...employee,
              name: update.name,
              birthDate: update.birthDate,
              deletedAt: null,
            }),
            expectedRecord: expect.objectContaining({
              ...employee,
              name: update.name,
              birthDate: update.birthDate,
              deletedAt: null,
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, reqBody, expectedResBody, expectedRecord }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            const record = await Employee.findByPk(employee.id, { raw: true });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(200);
            expect(record).toStrictEqual(expectedRecord);
          }
        );
      });
    });

    describe('DELETE', () => {
      const method = 'delete';

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
        const employee = createEmployee('04130338056');

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Record found',
            path: path(employee.id),
            expectedResBody: {},
            expectedRecord: expect.objectContaining({
              ...employee,
              deletedAt: expect.any(Date),
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedResBody, expectedRecord }) => {
            const res = await request(app)[method](path).set(headers);

            expect(res.status).toBe(204);
            expect(res.body).toStrictEqual(expectedResBody);

            const record = await Employee.findByPk(employee.id, {
              raw: true,
              paranoid: false,
            });

            expect(record).toStrictEqual(expectedRecord);
          }
        );
      });
    });
  });
});
