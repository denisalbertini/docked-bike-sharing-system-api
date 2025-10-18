import { faker } from '@faker-js/faker';
import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../../express/app.js';
import Employee from '../../model/models/employee.js';
import employeeRole from '../../model/shared/enum/employee-role.js';
import {
  NOT_FOUND_ERROR,
  UNIQUE_CONSTRAINT_ERROR,
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
        const admin = createEmployee(
          'EM-001',
          '04130338056',
          employeeRole.ADMIN,
          { birthDate: '2000-06-15' }
        );
        const operator = createEmployee(
          'EM-002',
          '59013719090',
          employeeRole.OPERATOR,
          { birthDate: '2000-06-15' }
        );

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.bulkCreate([admin, operator]);
        });

        const testCases = [
          {
            description: 'Record found',
            expectedResBody: [
              expect.objectContaining({ ...admin, deletedAt: null }),
              expect.objectContaining({ ...operator, deletedAt: null }),
            ],
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
        const conflictingEmployee = createEmployee(
          'EM-001',
          '60414127080',
          employeeRole.OPERATOR
        );

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.create(conflictingEmployee);
        });

        const newEmployee = createEmployee(
          'EM-001',
          '60414127080',
          employeeRole.OPERATOR
        );

        const testCases = [
          {
            description: 'Conflicting registration',
            reqBody: newEmployee,
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "employee_registration_key"',
            ],
          },
          {
            description: 'Conflicting CPF',
            reqBody: { ...newEmployee, registration: 'EM-002' },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "employee_cpf_key"',
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
        const invalidEmployee = createEmployee('abc', 'abc', 'abc', {
          name: 'abc',
          birthDate: 'abc',
        });
        const nullEmployee = createEmployee(null, null, null, {
          name: null,
          birthDate: null,
        });

        const testCases = [
          {
            description: 'Invalid data',
            reqBody: invalidEmployee,
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Invalid CPF.',
                'Validation is on registration failed',
                'Validation is on name failed',
                'Validation isDate on birthDate failed',
                'Validation isIn on role failed',
              ],
            },
          },
          {
            description: 'Null Data',
            reqBody: nullEmployee,
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Employee.registration cannot be null',
                'Employee.cpf cannot be null',
                'Employee.name cannot be null',
                'Employee.birthDate cannot be null',
                'Employee.role cannot be null',
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
        const admin = createEmployee(
          'EM-001',
          '78378763005',
          employeeRole.ADMIN,
          { birthDate: '2000-06-15' }
        );
        const operator = createEmployee(
          'EM-002',
          '19194767092',
          employeeRole.OPERATOR,
          { birthDate: '2000-06-15' }
        );

        beforeAll(truncateAllTables);

        const testCases = [
          {
            description: 'Admin',
            reqBody: admin,
            expectedResBody: expect.objectContaining({
              ...admin,
              deletedAt: null,
            }),
            expectedRecord: expect.objectContaining({
              ...admin,
              deletedAt: null,
            }),
          },
          {
            description: 'Operator',
            reqBody: operator,
            expectedResBody: expect.objectContaining({
              ...operator,
              deletedAt: null,
            }),
            expectedRecord: expect.objectContaining({
              ...operator,
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

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);

            const record = await Employee.findByPk(reqBody.id, { raw: true });

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
        const employee = createEmployee(
          'EM-001',
          '04130338056',
          employeeRole.ADMIN,
          { birthDate: '2000-06-15' }
        );

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

      describe('409', () => {
        const conflictingEmployee = createEmployee(
          'EM-001',
          '60414127080',
          employeeRole.OPERATOR
        );
        const updateEmployee = createEmployee(
          'EM-002',
          '19857763081',
          employeeRole.OPERATOR
        );

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.bulkCreate([conflictingEmployee, updateEmployee]);
        });

        const testCases = [
          {
            description: 'Conflicting registration',
            path: path(updateEmployee.id),
            reqBody: { registration: conflictingEmployee.registration },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "employee_registration_key"',
            ],
          },
          {
            description: 'Conflicting CPF',
            path: path(updateEmployee.id),
            reqBody: { cpf: conflictingEmployee.cpf },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "employee_cpf_key"',
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

            expect(res.body).toStrictEqual({
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(409);
          }
        );
      });

      describe('400', () => {
        const employee = createEmployee(
          'EM-001',
          '44493972076',
          employeeRole.OPERATOR
        );
        const invalidEmployee = createEmployee('abc', 'abc', 'abc', {
          name: 'abc',
          birthDate: 'abc',
        });
        const nullEmployee = createEmployee(null, null, null, {
          name: null,
          birthDate: null,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Invalid data',
            path: path(employee.id),
            reqBody: invalidEmployee,
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Invalid CPF.',
                'Validation is on registration failed',
                'Validation is on name failed',
                'Validation isDate on birthDate failed',
                'Validation isIn on role failed',
              ],
            },
          },
          {
            description: 'Null Data',
            path: path(employee.id),
            reqBody: nullEmployee,
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Employee.registration cannot be null',
                'Employee.cpf cannot be null',
                'Employee.name cannot be null',
                'Employee.birthDate cannot be null',
                'Employee.role cannot be null',
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
        const employee = createEmployee(
          'EM-001',
          '44493972076',
          employeeRole.OPERATOR
        );
        const update = createEmployee(
          'EM-002',
          '19194767092',
          employeeRole.OPERATOR,
          { birthDate: '2000-06-15' }
        );

        beforeAll(async () => {
          await truncateAllTables();
          await Employee.create(employee);
        });

        const testCases = [
          {
            description: 'Updated',
            path: path(employee.id),
            reqBody: update,
            expectedResBody: expect.objectContaining({
              ...update,
              deletedAt: null,
            }),
            expectedRecord: expect.objectContaining({
              ...update,
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

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(200);

            const record = await Employee.findByPk(reqBody.id, { raw: true });

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
        const employee = createEmployee(
          'EM-001',
          '04130338056',
          employeeRole.ADMIN,
          { birthDate: '2000-06-15' }
        );

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
