import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../express/app.js';
import Biker from '../../model/models/biker.js';
import CreditCard from '../../model/models/credit-card.js';
import Passport from '../../model/models/passport.js';
import {
  ACCESS,
  EMAIL_VERIFICATION,
} from '../../model/shared/enum/auth-purpose.js';
import bikerStatus from '../../model/shared/enum/biker-status.js';
import {
  AUTHENTICATION_ERROR,
  FORBIDDEN_ERROR,
  NOT_FOUND_ERROR,
  PRECONDITION_FAILED_ERROR,
  UNIQUE_CONSTRAINT_ERROR,
  VALIDATION_ERROR,
} from '../../model/shared/enum/error-types';
import {
  createBiker,
  createCreditCard,
  createPassport,
} from '../data-factory.js';
import { bikerToken, emailConfirmationToken } from '../tokens.js';
import truncateAllTables from '../truncate-tables.js';

jest.setTimeout(10000);

const headers = { authorization: `Bearer ${bikerToken}` };

describe('/api/bikers', () => {
  describe('/', () => {
    const path = '/api/bikers';

    describe('POST', () => {
      const method = 'post';

      describe('409', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, { cpf: '85389004043' });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.create(biker);
        });

        const testCases = [
          {
            description: 'Existing CPF',
            reqBody: {
              biker: {
                ...biker,
                id: undefined,
                password: 'secret',
                confirmationPassword: 'secret',
              },
              creditCard,
            },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "biker_cpf_key"',
            ],
          },
          {
            description: 'Existing email',
            reqBody: {
              biker: {
                ...biker,
                id: undefined,
                cpf: '30071416056',
                password: 'secret',
                confirmationPassword: 'secret',
              },
              creditCard,
            },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "biker_email_key"',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)[method](path).send(reqBody);

            expect(res.body).toStrictEqual({
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(409);
          }
        );
      });

      describe('400', () => {
        const validCreditCard = createCreditCard();
        const invalidCreditCard = createCreditCard({
          creditCardNumber: 'abc',
          holderName: 'abc',
          expirationDate: 'abc',
          cvv: 'abc',
        });

        const bikerWithoutCpf = createBiker(null);
        const bikerWithCpf = createBiker(null, {
          cpf: '30071416056',
        });

        const passport = createPassport();

        const testCases = [
          {
            description: 'No documents',
            reqBody: {
              biker: {
                ...bikerWithoutCpf,
                password: 'abc',
                confirmationPassword: 'abc',
              },
              creditCard: validCreditCard,
            },
            expectedErrors: ['Biker must have a document.'],
          },
          {
            description: 'Both documents',
            reqBody: {
              biker: {
                ...bikerWithCpf,
                password: 'abc',
                confirmationPassword: 'abc',
              },
              creditCard: validCreditCard,
              passport,
            },
            expectedErrors: ['Biker can only have one document.'],
          },
          {
            description: 'Passwords not matching',
            reqBody: {
              biker: {
                ...bikerWithCpf,
                confirmationPassword: 'abc',
              },
              creditCard: validCreditCard,
            },
            expectedErrors: ['Passwords do not match.'],
          },
          {
            description: 'Invalid credit card data',
            reqBody: {
              biker: {
                ...bikerWithCpf,
                password: 'abc',
                confirmationPassword: 'abc',
              },
              creditCard: invalidCreditCard,
            },
            expectedErrors: [
              'Invalid credit card number.',
              'Invalid credit card expiration date.',
              'Invalid credit card cvv.',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)[method](path).send(reqBody);

            expect(res.body).toStrictEqual({
              errorType: VALIDATION_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(400);
          }
        );
      });

      describe('200', () => {
        beforeAll(truncateAllTables);

        const creditCard = createCreditCard();
        const bikerWithCpf = createBiker(creditCard.id, { cpf: '18500059079' });
        const bikerWithoutCpf = createBiker(creditCard.id);
        const passport = createPassport();

        const testCases = [
          {
            description: 'With CPF',
            reqBody: {
              biker: {
                ...bikerWithCpf,
                password: 'abc',
                confirmationPassword: 'abc',
              },
              creditCard,
            },
            expectedResBody: {
              creditCard: {
                id: expect.any(String),
                creditCardNumber: creditCard.creditCardNumber,
                holderName: creditCard.holderName,
                expirationDate: creditCard.expirationDate,
              },
              biker: {
                ...bikerWithCpf,
                password: expect.any(String),
                status: bikerStatus.PENDING,
                creditCardId: expect.any(String),
              },
            },
            expectedCreditCardRecord: expect.objectContaining({
              id: expect.any(String),
              creditCardNumber: creditCard.creditCardNumber,
              holderName: creditCard.holderName,
              expirationDate: creditCard.expirationDate,
            }),
            expectedBikerRecord: {
              ...bikerWithCpf,
              password: expect.any(String),
              creditCardId: expect.any(String),
              status: bikerStatus.PENDING,
            },
            expectedPassportRecord: null,
          },
          {
            description: 'With passport',
            reqBody: {
              biker: {
                ...bikerWithoutCpf,
                password: 'abc',
                confirmationPassword: 'abc',
              },
              creditCard,
              passport,
            },
            expectedResBody: {
              creditCard: {
                id: expect.any(String),
                creditCardNumber: creditCard.creditCardNumber,
                holderName: creditCard.holderName,
                expirationDate: creditCard.expirationDate,
              },
              biker: {
                ...bikerWithoutCpf,
                password: expect.any(String),
                status: bikerStatus.PENDING,
                creditCardId: expect.any(String),
              },
              passport: { ...passport, bikerId: bikerWithoutCpf.id },
            },
            expectedCreditCardRecord: expect.objectContaining({
              id: expect.any(String),
              creditCardNumber: creditCard.creditCardNumber,
              holderName: creditCard.holderName,
              expirationDate: creditCard.expirationDate,
            }),
            expectedBikerRecord: {
              ...bikerWithoutCpf,
              password: expect.any(String),
              creditCardId: expect.any(String),
              status: bikerStatus.PENDING,
            },
            expectedPassportRecord: expect.objectContaining({
              ...passport,
              bikerId: bikerWithoutCpf.id,
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            reqBody,
            expectedResBody,
            expectedCreditCardRecord,
            expectedBikerRecord,
            expectedPassportRecord,
          }) => {
            const res = await request(app)[method](path).send(reqBody);

            const creditCardRecord = await CreditCard.findOne({
              include: { model: Biker, where: { email: reqBody.biker.email } },
              raw: true,
            });

            const bikerRecord = await Biker.findOne({
              where: { email: reqBody.biker.email },
              raw: true,
            });

            const passportRecord = await Passport.findOne({
              include: { model: Biker, where: { email: reqBody.biker.email } },
              raw: true,
            });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);
            expect(creditCardRecord).toStrictEqual(expectedCreditCardRecord);
            expect(bikerRecord).toStrictEqual(expectedBikerRecord);
            expect(passportRecord).toStrictEqual(expectedPassportRecord);
          }
        );
      });
    });
  });

  describe('/:id', () => {
    const path = id => `/api/bikers/${id}`;

    describe('PUT', () => {
      const method = 'put';

      describe('409', () => {
        const creditCard = createCreditCard();
        const conflictingBiker = createBiker(creditCard.id);
        const bikerToUpdate = createBiker(creditCard.id);

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([conflictingBiker, bikerToUpdate]);
        });

        const testCases = [
          {
            description: 'Conflicting email',
            path: path(bikerToUpdate.id),
            reqBody: {
              biker: { email: conflictingBiker.email },
            },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "biker_email_key"',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .send(reqBody)
              .set(headers);

            expect(res.body).toStrictEqual({
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(409);
          }
        );
      });

      describe('400', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, { cpf: '75386545000' });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.create(biker);
        });

        const testCases = [
          {
            description: 'Invalid data',
            path: path(biker.id),
            reqBody: { biker: { cpf: 'abc', password: 'abc' }, passport: {} },
            expectedErrors: [
              'CPF cannot be modified.',
              'Biker already has a document.',
              'Passwords do not match',
            ],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, reqBody, expectedErrors }) => {
            const res = await request(app)
              [method](path)
              .send(reqBody)
              .set(headers);

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual({
              errorType: VALIDATION_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('200', () => {
        const creditCard = createCreditCard();
        const bikerWithCpf = createBiker(creditCard.id, {
          cpf: '75386545000',
          status: bikerStatus.ACTIVE,
        });
        const bikerWithoutCpf = createBiker(creditCard.id, {
          status: bikerStatus.ACTIVE,
        });
        const passport = createPassport(bikerWithoutCpf.id);

        beforeEach(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([bikerWithCpf, bikerWithoutCpf]);
          await Passport.create(passport);
        });

        const bikerUpdateData = createBiker(undefined);
        const passportUpdateData = createPassport(undefined, {
          id: undefined,
          bikerId: undefined,
        });

        const testCases = [
          {
            description: 'Has CPF document',
            path: path(bikerWithCpf.id),
            reqBody: {
              biker: {
                ...bikerUpdateData,
                id: undefined,
                cpf: undefined,
                password: 'abc',
                confirmationPassword: 'abc',
              },
            },
            expectedResBody: {
              biker: {
                ...bikerUpdateData,
                id: bikerWithCpf.id,
                cpf: bikerWithCpf.cpf,
                password: expect.any(String),
                status: bikerStatus.ACTIVE,
                creditCardId: expect.any(String),
              },
            },
            expectedBikerRecord: {
              ...bikerUpdateData,
              id: bikerWithCpf.id,
              cpf: bikerWithCpf.cpf,
              password: expect.any(String),
              status: bikerStatus.ACTIVE,
              creditCardId: creditCard.id,
              'CreditCard.id': creditCard.id,
              'CreditCard.creditCardNumber': creditCard.creditCardNumber,
              'CreditCard.holderName': creditCard.holderName,
              'CreditCard.expirationDate': creditCard.expirationDate,
              'Passport.id': null,
              'Passport.passportNumber': null,
              'Passport.expirationDate': null,
              'Passport.countryCode': null,
              'Passport.bikerId': null,
            },
          },
          {
            description: 'Has Passport document',
            path: path(bikerWithoutCpf.id),
            reqBody: {
              biker: {
                ...bikerUpdateData,
                id: undefined,
                cpf: undefined,
                password: 'abc',
                confirmationPassword: 'abc',
              },
              passport: passportUpdateData,
            },
            expectedResBody: {
              biker: {
                ...bikerUpdateData,
                id: bikerWithoutCpf.id,
                password: expect.any(String),
                status: bikerStatus.ACTIVE,
                creditCardId: expect.any(String),
              },
              passport: {
                ...passportUpdateData,
                id: passport.id,
                bikerId: bikerWithoutCpf.id,
              },
            },
            expectedBikerRecord: {
              ...bikerUpdateData,
              id: bikerWithoutCpf.id,
              password: expect.any(String),
              status: bikerStatus.ACTIVE,
              creditCardId: creditCard.id,
              'CreditCard.id': creditCard.id,
              'CreditCard.creditCardNumber': creditCard.creditCardNumber,
              'CreditCard.holderName': creditCard.holderName,
              'CreditCard.expirationDate': creditCard.expirationDate,
              'Passport.id': passport.id,
              'Passport.passportNumber': passportUpdateData.passportNumber,
              'Passport.expirationDate': passportUpdateData.expirationDate,
              'Passport.countryCode': passportUpdateData.countryCode,
              'Passport.bikerId': bikerWithoutCpf.id,
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, reqBody, expectedResBody, expectedBikerRecord }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            const bikerRecord = await Biker.findOne({
              where: { email: reqBody.biker.email },
              include: [CreditCard, Passport],
              raw: true,
            });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(200);
            expect(bikerRecord).toStrictEqual(expectedBikerRecord);
          }
        );
      });
    });
  });

  describe('/:id/confirm', () => {
    const path = (id, token) => `/api/bikers/${id}/confirm?token=${token}`;

    describe('GET', () => {
      const method = 'get';

      describe('412', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, {
          status: bikerStatus.ACTIVE,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([biker]);
        });

        const testCases = [
          {
            description: 'ACTIVE status',
            path: path(
              biker.id,
              emailConfirmationToken(biker.id, EMAIL_VERIFICATION)
            ),
          },
        ];

        test.each(testCases)('$description', async ({ path }) => {
          const res = await request(app)[method](path);

          expect(res.body).toStrictEqual({
            errorType: PRECONDITION_FAILED_ERROR,
            errors: ['Account not pending.'],
          });
          expect(res.status).toBe(412);
        });
      });

      describe('403', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, {
          status: bikerStatus.ACTIVE,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([biker]);
        });

        const testCases = [
          {
            description: 'Invalid query id',
            path: path(
              'abc',
              emailConfirmationToken(biker.id, EMAIL_VERIFICATION)
            ),
          },
          {
            description: 'Invalid token id',
            path: path(
              biker.id,
              emailConfirmationToken('abc', EMAIL_VERIFICATION)
            ),
          },
          {
            description: 'Invalid token purpose',
            path: path(biker.id, emailConfirmationToken('abc', ACCESS)),
          },
        ];

        test.each(testCases)('$description', async ({ path }) => {
          const res = await request(app)[method](path);

          expect(res.body).toStrictEqual({
            errorType: FORBIDDEN_ERROR,
            errors: ['Invalid email confirmation request.'],
          });
          expect(res.status).toBe(403);
        });
      });

      describe('204', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id);

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.create(biker);
        });

        const testCases = [
          {
            description: 'Pending account',
            path: path(
              biker.id,
              emailConfirmationToken(biker.id, EMAIL_VERIFICATION)
            ),
            expectedRecord: expect.objectContaining({
              ...biker,
              status: bikerStatus.ACTIVE,
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, expectedRecord }) => {
            const res = await request(app)[method](path);

            const bikerRecord = await Biker.findByPk(biker.id, { raw: true });

            expect(res.body).toStrictEqual({});
            expect(res.status).toBe(204);
            expect(bikerRecord).toStrictEqual(expectedRecord);
          }
        );
      });
    });
  });

  describe('/:id/credit-cards', () => {
    const path = id => `/api/bikers/${id}/credit-cards`;

    describe('PUT', () => {
      const method = 'put';

      describe('204', () => {
        const originalCreditCard = createCreditCard();
        const existingCreditCard = createCreditCard();
        const biker = createBiker(originalCreditCard.id, {
          status: bikerStatus.ACTIVE,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.bulkCreate([originalCreditCard, existingCreditCard]);
          await Biker.bulkCreate([biker]);
        });

        const newCreditCard = createCreditCard();

        const testCases = [
          {
            description: 'Existing credit card',
            path: path(biker.id),
            reqBody: existingCreditCard,
            expectedBikerRecord: {
              ...biker,
              creditCardId: existingCreditCard.id,
              'CreditCard.id': existingCreditCard.id,
              'CreditCard.creditCardNumber':
                existingCreditCard.creditCardNumber,
              'CreditCard.holderName': existingCreditCard.holderName,
              'CreditCard.expirationDate': existingCreditCard.expirationDate,
            },
          },
          {
            description: 'New credit card',
            path: path(biker.id),
            reqBody: newCreditCard,
            expectedBikerRecord: {
              ...biker,
              creditCardId: expect.any(String),
              'CreditCard.id': expect.any(String),
              'CreditCard.creditCardNumber': newCreditCard.creditCardNumber,
              'CreditCard.holderName': newCreditCard.holderName,
              'CreditCard.expirationDate': newCreditCard.expirationDate,
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ path, reqBody, expectedBikerRecord }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            const bikerRecord = await Biker.findOne({
              where: { id: biker.id },
              include: CreditCard,
              raw: true,
            });

            expect(res.body).toStrictEqual({});
            expect(res.status).toBe(204);
            expect(bikerRecord).toStrictEqual(expectedBikerRecord);
          }
        );
      });
    });
  });

  describe('/login', () => {
    const path = '/api/bikers/login';

    describe('POST', () => {
      const method = 'post';

      describe('404', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id);

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.create(biker);
        });

        const testCases = [
          {
            description: 'Pending account',
            reqBody: { email: biker.email, password: 'abc' },
            expectedErrors: ['Account does not exist.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)[method](path).send(reqBody);

            expect(res.status).toBe(404);
            expect(res.body).toStrictEqual({
              errorType: NOT_FOUND_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('401', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, {
          status: bikerStatus.ACTIVE,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([biker]);
        });

        const testCases = [
          {
            description: 'Incorrect password',
            reqBody: { email: biker.email, password: 'abc' },
            expectedErrors: ['Incorrect credentials.'],
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedErrors }) => {
            const res = await request(app)[method](path).send(reqBody);

            expect(res.status).toBe(401);
            expect(res.body).toStrictEqual({
              errorType: AUTHENTICATION_ERROR,
              errors: expectedErrors,
            });
          }
        );
      });

      describe('200', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, {
          password: bcrypt.hashSync('secret', 10),
          status: bikerStatus.ACTIVE,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([biker]);
        });

        const testCases = [
          {
            description: 'Correct password',
            reqBody: { email: biker.email, password: 'secret' },
          },
        ];

        test.each(testCases)('$description', async ({ reqBody }) => {
          const res = await request(app)[method](path).send(reqBody);

          const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({ token: expect.any(String) });
          expect(payload.id).toBe(biker.id);
          expect(payload.purpose).toBe(ACCESS);
        });
      });
    });
  });
});
