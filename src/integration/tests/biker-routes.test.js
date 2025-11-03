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
        const bikerWithCpf = createBiker(creditCard.id, { cpf: '85389004043' });
        const bikerWithPassport = createBiker(creditCard.id);
        const passport = createPassport(bikerWithPassport.id);

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([bikerWithCpf, bikerWithPassport]);
          await Passport.create(passport);
        });

        const { cpf, name, birthDate, email } = createBiker(null, {
          cpf: '18500059079',
        });
        const { passportNumber, passportExpirationDate, countryCode } =
          createPassport(null);

        const testCases = [
          {
            description: 'Existing CPF',
            reqBody: {
              biker: {
                cpf: bikerWithCpf.cpf,
                name,
                birthDate,
                email,
                password: 'secret',
                confirmationPassword: 'secret',
              },
              creditCard: {
                creditCardNumber: creditCard.creditCardNumber,
                holderName: creditCard.holderName,
                creditCardExpirationDate: creditCard.creditCardExpirationDate,
                cvv: creditCard.cvv,
              },
            },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "biker_cpf_key"',
            ],
          },
          {
            description: 'Existing email',
            reqBody: {
              biker: {
                cpf,
                name,
                birthDate,
                email: bikerWithCpf.email,
                password: 'secret',
                confirmationPassword: 'secret',
              },
              creditCard: {
                creditCardNumber: creditCard.creditCardNumber,
                holderName: creditCard.holderName,
                creditCardExpirationDate: creditCard.creditCardExpirationDate,
                cvv: creditCard.cvv,
              },
            },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "biker_email_key"',
            ],
          },
          {
            description: 'Existing passport',
            reqBody: {
              biker: {
                name,
                birthDate,
                email,
                password: 'secret',
                confirmationPassword: 'secret',
              },
              creditCard: {
                creditCardNumber: creditCard.creditCardNumber,
                holderName: creditCard.holderName,
                creditCardExpirationDate: creditCard.creditCardExpirationDate,
                cvv: creditCard.cvv,
              },
              passport: {
                passportNumber: passport.passportNumber,
                passportExpirationDate,
                countryCode,
              },
            },
            expectedErrors: [
              'duplicar valor da chave viola a restrição de unicidade "passport_passport_number_key"',
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
        const { cpf, name, birthDate, email } = createBiker(null, {
          cpf: '18500059079',
        });

        const testCases = [
          {
            description: 'Invalid data',
            reqBody: {
              biker: {
                cpf,
                name,
                birthDate,
                email,
                password: 'abc',
                confirmationPassword: 'def',
              },
              creditCard: {
                creditCardNumber: '123',
                holderName: '123',
                creditCardExpirationDate: 'abc',
                cvv: 'abc',
              },
            },
            expectedErrors: [
              'Passwords do not match.',
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
        beforeEach(truncateAllTables);

        const { creditCardNumber, holderName, creditCardExpirationDate, cvv } =
          createCreditCard();
        const { cpf, name, birthDate, email } = createBiker(null, {
          cpf: '18500059079',
        });
        const { passportNumber, passportExpirationDate, countryCode } =
          createPassport();

        const testCases = [
          {
            description: 'With CPF',
            reqBody: {
              creditCard: {
                creditCardNumber,
                holderName,
                creditCardExpirationDate,
                cvv,
              },
              biker: {
                cpf,
                name,
                birthDate,
                email,
                password: 'abc',
                confirmationPassword: 'abc',
              },
            },
            expectedResBody: {
              creditCard: {
                id: expect.any(String),
                creditCardNumber,
                holderName,
                creditCardExpirationDate,
              },
              biker: {
                id: expect.any(String),
                cpf,
                name,
                birthDate,
                email,
                password: expect.any(String),
                status: bikerStatus.PENDING,
                creditCardId: expect.any(String),
              },
            },
            expectedCreditCardRecord: {
              id: expect.any(String),
              creditCardNumber,
              holderName,
              creditCardExpirationDate,
            },
            expectedBikerRecord: {
              id: expect.any(String),
              cpf,
              name,
              birthDate,
              email,
              password: expect.any(String),
              status: bikerStatus.PENDING,
              creditCardId: expect.any(String),
            },
            expectedPassportRecord: null,
          },
          {
            description: 'With passport',
            reqBody: {
              creditCard: {
                creditCardNumber,
                holderName,
                creditCardExpirationDate,
                cvv,
              },
              biker: {
                name,
                birthDate,
                email,
                password: 'abc',
                confirmationPassword: 'abc',
              },
              passport: { passportNumber, passportExpirationDate, countryCode },
            },
            expectedResBody: {
              creditCard: {
                id: expect.any(String),
                creditCardNumber,
                holderName,
                creditCardExpirationDate,
              },
              biker: {
                id: expect.any(String),
                cpf: null,
                name,
                birthDate,
                email,
                password: expect.any(String),
                status: bikerStatus.PENDING,
                creditCardId: expect.any(String),
              },
              passport: {
                id: expect.any(String),
                passportNumber,
                passportExpirationDate,
                countryCode,
                bikerId: expect.any(String),
              },
            },
            expectedCreditCardRecord: {
              id: expect.any(String),
              creditCardNumber,
              holderName,
              creditCardExpirationDate,
            },
            expectedBikerRecord: {
              id: expect.any(String),
              cpf: null,
              name,
              birthDate,
              email,
              password: expect.any(String),
              status: bikerStatus.PENDING,
              creditCardId: expect.any(String),
            },
            expectedPassportRecord: {
              id: expect.any(String),
              passportNumber,
              passportExpirationDate,
              countryCode,
              bikerId: expect.any(String),
            },
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
              where: { creditCardNumber },
              raw: true,
            });
            const bikerRecord = await Biker.findOne({
              where: { email },
              raw: true,
            });
            const passportRecord = await Passport.findOne({
              where: { passportNumber },
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
        const bikerWithCpf = createBiker(creditCard.id, { cpf: '75386545000' });
        const bikerWithoutCpf = createBiker(creditCard.id);
        const passport = createPassport(bikerWithoutCpf.id);

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([bikerWithCpf, bikerWithoutCpf]);
          await Passport.create(passport);
        });

        const testCases = [
          {
            description: 'Passwords do not match',
            path: path(bikerWithCpf.id),
            reqBody: {
              biker: {
                password: 'abc',
                confirmationPassword: 'def',
              },
            },
            expectedErrors: ['Passwords do not match'],
          },
          {
            description: 'Invalid biker data',
            path: path(bikerWithCpf.id),
            reqBody: {
              biker: {
                name: '123',
                birthDate: '1900-06-15',
              },
            },
            expectedErrors: [
              'Validation hasValidYear on birthDate failed',
              'Validation is on name failed',
            ],
          },
          {
            description: 'Invalid passport data',
            path: path(bikerWithoutCpf.id),
            reqBody: {
              biker: {},
              passport: {
                passportNumber: 'abc',
                passportExpirationDate: '1900-06-15',
                countryCode: 'abc',
              },
            },
            expectedErrors: expect.arrayContaining([
              'Validation hasValidYear on expirationDate failed',
              'Validation is on passportNumber failed',
              'Validation is on countryCode failed',
            ]),
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
              errorType: VALIDATION_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(400);
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

        const { name, birthDate, email } = createBiker();
        const { passportNumber, passportExpirationDate, countryCode } =
          createPassport();

        const testCases = [
          {
            description: 'Has CPF document',
            path: path(bikerWithCpf.id),
            reqBody: {
              biker: {
                name,
                birthDate,
                email,
                password: 'abc',
                confirmationPassword: 'abc',
              },
            },
            expectedResBody: {
              biker: {
                name,
                birthDate,
                email,
                id: bikerWithCpf.id,
                cpf: bikerWithCpf.cpf,
                password: expect.any(String),
                status: bikerStatus.ACTIVE,
                creditCardId: expect.any(String),
              },
            },
            expectedBikerRecord: {
              name,
              birthDate,
              email,
              id: bikerWithCpf.id,
              cpf: bikerWithCpf.cpf,
              password: expect.any(String),
              status: bikerStatus.ACTIVE,
              creditCardId: creditCard.id,
              'CreditCard.id': creditCard.id,
              'CreditCard.creditCardNumber': creditCard.creditCardNumber,
              'CreditCard.holderName': creditCard.holderName,
              'CreditCard.creditCardExpirationDate':
                creditCard.creditCardExpirationDate,
              'Passport.id': null,
              'Passport.passportNumber': null,
              'Passport.passportExpirationDate': null,
              'Passport.countryCode': null,
              'Passport.bikerId': null,
            },
          },
          {
            description: 'Has Passport document',
            path: path(bikerWithoutCpf.id),
            reqBody: {
              biker: {
                name,
                birthDate,
                email,
                id: undefined,
                cpf: undefined,
                password: 'abc',
                confirmationPassword: 'abc',
              },
              passport: { passportNumber, passportExpirationDate, countryCode },
            },
            expectedResBody: {
              biker: {
                name,
                birthDate,
                email,
                cpf: null,
                id: bikerWithoutCpf.id,
                password: expect.any(String),
                status: bikerStatus.ACTIVE,
                creditCardId: expect.any(String),
              },
              passport: {
                passportNumber,
                passportExpirationDate,
                countryCode,
                id: passport.id,
                bikerId: bikerWithoutCpf.id,
              },
            },
            expectedBikerRecord: {
              name,
              birthDate,
              email,
              cpf: null,
              id: bikerWithoutCpf.id,
              password: expect.any(String),
              status: bikerStatus.ACTIVE,
              creditCardId: creditCard.id,
              'CreditCard.id': creditCard.id,
              'CreditCard.creditCardNumber': creditCard.creditCardNumber,
              'CreditCard.holderName': creditCard.holderName,
              'CreditCard.creditCardExpirationDate':
                creditCard.creditCardExpirationDate,
              'Passport.id': passport.id,
              'Passport.passportNumber': passportNumber,
              'Passport.passportExpirationDate': passportExpirationDate,
              'Passport.countryCode': countryCode,
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

        const { creditCardNumber, holderName, creditCardExpirationDate, cvv } =
          createCreditCard();

        const testCases = [
          {
            description: 'Existing credit card',
            path: path(biker.id),
            reqBody: {
              creditCardNumber: existingCreditCard.creditCardNumber,
              holderName: existingCreditCard.holderName,
              creditCardExpirationDate:
                existingCreditCard.creditCardExpirationDate,
              cvv: existingCreditCard.cvv,
            },
            expectedBikerRecord: {
              ...biker,
              creditCardId: existingCreditCard.id,
              'CreditCard.id': existingCreditCard.id,
              'CreditCard.creditCardNumber':
                existingCreditCard.creditCardNumber,
              'CreditCard.holderName': existingCreditCard.holderName,
              'CreditCard.creditCardExpirationDate':
                existingCreditCard.creditCardExpirationDate,
            },
          },
          {
            description: 'New credit card',
            path: path(biker.id),
            reqBody: {
              creditCardNumber,
              holderName,
              creditCardExpirationDate,
              cvv,
            },
            expectedBikerRecord: {
              ...biker,
              creditCardId: expect.any(String),
              'CreditCard.id': expect.any(String),
              'CreditCard.creditCardNumber': creditCardNumber,
              'CreditCard.holderName': holderName,
              'CreditCard.creditCardExpirationDate': creditCardExpirationDate,
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

          expect(res.body).toStrictEqual({ token: expect.any(String) });
          expect(res.status).toBe(200);

          const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
          expect(payload.id).toBe(biker.id);
          expect(payload.purpose).toBe(ACCESS);
        });
      });
    });
  });
});
