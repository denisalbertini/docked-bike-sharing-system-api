import { beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
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
  PRECONDITION_FAILED_ERROR,
  UNIQUE_CONSTRAINT_ERROR,
  VALIDATION_ERROR,
} from '../../model/shared/enum/error-types';
import { bikerData, creditCardData, passportData } from '../test-data';
import { bikerToken, emailConfirmationToken } from '../tokens.js';
import truncateAllTables from '../truncate-tables.js';

const headers = { authorization: `Bearer ${bikerToken}` };

describe('/api/bikers', () => {
  describe('/', () => {
    const path = '/api/bikers';

    describe('POST', () => {
      const method = 'post';

      describe('409', () => {
        const creditCard = creditCardData[0];
        const biker = bikerData[0];

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
              creditCard: {
                ...creditCard,
                id: undefined,
                expirationDate: '06/2030',
                cvv: '111',
              },
            },
            expectedResBody: {
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: [
                'duplicar valor da chave viola a restrição de unicidade "biker_cpf_key"',
              ],
            },
          },
          {
            description: 'Existing mail',
            reqBody: {
              biker: {
                ...biker,
                id: undefined,
                cpf: bikerData[1].cpf,
                password: 'secret',
                confirmationPassword: 'secret',
              },
              creditCard: {
                ...creditCard,
                id: undefined,
                expirationDate: '06/2030',
                cvv: '111',
              },
            },
            expectedResBody: {
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: [
                'duplicar valor da chave viola a restrição de unicidade "biker_email_key"',
              ],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)[method](path).send(reqBody);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(409);
          }
        );
      });

      describe('400', () => {
        const testCases = [
          {
            description: 'Local',
            reqBody: {
              biker: {
                password: 'abc',
                confirmationPassword: 'def',
              },
              creditCard: {
                creditCardNumber: 'abc',
                holderName: 'abc',
                expirationDate: '06/2020',
              },
            },
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'CPF is mandatory for locals.',
                'Passwords do not match.',
                'Invalid credit card number.',
                'Invalid credit card expiration date.',
                'Invalid credit card cvv.',
              ],
            },
          },
          {
            description: 'Foreigner',
            reqBody: {
              biker: {
                cpf: 'abc',
                password: 'abc',
                confirmationPassword: 'def',
                foreigner: true,
              },
              creditCard: {
                creditCardNumber: 'abc',
                holderName: 'abc',
                expirationDate: '06/2020',
              },
            },
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Foreigners cannot have a cpf.',
                'Passport data is mandatory for foreigners.',
                'Passwords do not match.',
                'Invalid credit card number.',
                'Invalid credit card expiration date.',
                'Invalid credit card cvv.',
              ],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)[method](path).send(reqBody);

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('200', () => {
        const creditCard = { ...creditCardData[0], cvv: '111' };

        const localBiker = {
          ...bikerData[0],
          id: undefined,
          password: 'secret',
          confirmationPassword: 'secret',
        };

        const foreignerBiker = {
          ...bikerData[0],
          cpf: undefined,
          password: 'secret',
          confirmationPassword: 'secret',
          foreigner: true,
        };
        const passport = {
          passportNumber: 'abc123',
          expirationDate: '2030-06-15',
          countryCode: 'USA',
        };

        const expectedLocalRecord = {
          cpf: localBiker.cpf,
          name: localBiker.name,
          birthDate: localBiker.birthDate,
          email: localBiker.email,
          foreigner: localBiker.foreigner,
          status: bikerStatus.PENDING,
        };
        const expectedForeignerRecord = {
          name: foreignerBiker.name,
          birthDate: foreignerBiker.birthDate,
          email: foreignerBiker.email,
          foreigner: foreignerBiker.foreigner,
          status: bikerStatus.PENDING,
        };

        beforeEach(truncateAllTables);

        const testCases = [
          {
            description: 'Local',
            reqBody: {
              biker: localBiker,
              creditCard,
            },
            expectedResBody: expect.objectContaining(expectedLocalRecord),
            expectedBikerRecord: expect.objectContaining(expectedLocalRecord),
            expectedPassportRecord: undefined,
          },
          {
            description: 'Foreigner',
            reqBody: {
              biker: foreignerBiker,
              creditCard,
              passport,
            },
            expectedResBody: expect.objectContaining({
              ...expectedForeignerRecord,
              passport,
            }),
            expectedBikerRecord: expect.objectContaining(
              expectedForeignerRecord
            ),
            expectedPassportRecord: expect.objectContaining(passport),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            reqBody,
            expectedResBody,
            expectedBikerRecord,
            expectedPassportRecord,
          }) => {
            const res = await request(app)[method](path).send(reqBody);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);

            const createdBikerRecord = await Biker.findOne({
              where: { email: reqBody.biker.email },
              raw: true,
            });

            expect(createdBikerRecord).toStrictEqual(expectedBikerRecord);

            if (reqBody.biker.foreigner) {
              const createdPassportRecord = await Passport.findOne({
                where: { bikerId: foreignerBiker.id },
                raw: true,
              });

              expect(createdPassportRecord).toStrictEqual(
                expectedPassportRecord
              );
            }
          }
        );
      });
    });
  });

  describe('/:id', () => {
    const path = `/api/bikers/${bikerData[0].id}`;

    describe('PUT', () => {
      const method = 'put';

      describe('409', () => {
        const creditCard = creditCardData[0];
        const biker = bikerData[0];
        const conflictingBiker = bikerData[1];

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([biker, conflictingBiker]);
        });

        const testCases = [
          {
            description: 'Existing CPF',
            reqBody: {
              biker: { cpf: conflictingBiker.cpf },
              creditCard: {
                ...creditCard,
                id: undefined,
                expirationDate: '06/2030',
                cvv: '111',
              },
            },
            expectedResBody: {
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: [
                'duplicar valor da chave viola a restrição de unicidade "biker_cpf_key"',
              ],
            },
          },
          {
            description: 'Existing email',
            reqBody: {
              biker: { email: conflictingBiker.email },
              creditCard: {
                ...creditCard,
                id: undefined,
                expirationDate: '06/2030',
                cvv: '111',
              },
            },
            expectedResBody: {
              errorType: UNIQUE_CONSTRAINT_ERROR,
              errors: [
                'duplicar valor da chave viola a restrição de unicidade "biker_email_key"',
              ],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .send(reqBody)
              .set(headers);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(409);
          }
        );
      });

      describe('400', () => {
        const testCases = [
          {
            description: 'Local',
            reqBody: {
              biker: {
                password: 'abc',
                confirmationPassword: 'def',
              },
            },
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: ['Passwords do not match.'],
            },
          },
          {
            description: 'Foreigner',
            reqBody: {
              biker: {
                cpf: 'abc',
                password: 'abc',
                confirmationPassword: 'def',
                foreigner: true,
              },
              creditCard: {
                creditCardNumber: 'abc',
                holderName: 'abc',
                expirationDate: '06/2020',
              },
            },
            expectedResBody: {
              errorType: VALIDATION_ERROR,
              errors: [
                'Foreigners cannot have a cpf.',
                'Passport data is mandatory for foreigners.',
                'Passwords do not match.',
              ],
            },
          },
        ];

        test.each(testCases)(
          '$description',
          async ({ reqBody, expectedResBody }) => {
            const res = await request(app)
              [method](path)
              .send(reqBody)
              .set(headers);

            expect(res.status).toBe(400);
            expect(res.body).toStrictEqual(expectedResBody);
          }
        );
      });

      describe('200', () => {
        const creditCard = creditCardData[0];

        const localToUpdate = bikerData[0];
        const localUpdateData = {
          biker: {
            ...bikerData[1],
            id: undefined,
            password: 'test',
            confirmationPassword: 'test',
            creditCardId: undefined,
          },
        };

        const foreignerToUpdate = bikerData[2];
        const passport = passportData[0];
        const foreignerUpdateData = {
          biker: {
            ...bikerData[1],
            id: undefined,
            cpf: undefined,
            email: 'email4@address.com',
            password: 'test',
            confirmationPassword: 'test',
            creditCardId: undefined,
          },
          passport: {
            passportNumber: '123abc',
            expirationDate: '2040-06-15',
            countryCode: 'CAN',
          },
        };

        const expectedLocalRecord = expect.objectContaining({
          cpf: localUpdateData.biker.cpf,
          name: localUpdateData.biker.name,
          birthDate: localUpdateData.biker.birthDate,
          email: localUpdateData.biker.email,
          foreigner: localUpdateData.biker.foreigner,
        });
        const expectedForeignerRecord = expect.objectContaining({
          name: foreignerUpdateData.biker.name,
          birthDate: foreignerUpdateData.biker.birthDate,
          email: foreignerUpdateData.biker.email,
          foreigner: foreignerUpdateData.biker.foreigner,
        });
        const expectedPassportRecord = expect.objectContaining({
          passport: foreignerUpdateData.passport,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.bulkCreate([localToUpdate, foreignerToUpdate]);
          await Passport.create(passport);
        });

        const testCases = [
          {
            description: 'Local',
            path,
            reqBody: localUpdateData,
            expectedResBody: expectedLocalRecord,
            expectedBikerRecord: expectedLocalRecord,
            expectedPassportRecord: undefined,
          },
          {
            description: 'Foreigner',
            path: `/api/bikers/${bikerData[2].id}`,
            reqBody: foreignerUpdateData,
            expectedResBody: expect.objectContaining({
              name: foreignerUpdateData.biker.name,
              birthDate: foreignerUpdateData.biker.birthDate,
              email: foreignerUpdateData.biker.email,
              foreigner: foreignerUpdateData.biker.foreigner,
              passport: foreignerUpdateData.passport,
            }),
            expectedBikerRecord: expectedForeignerRecord,
            expectedPassportRecord: expectedPassportRecord,
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            path,
            reqBody,
            expectedResBody,
            expectedBikerRecord,
            expectedPassportRecord,
          }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(200);

            const updatedBikerRecord = await Biker.findOne({
              where: { email: reqBody.biker.email },
              raw: true,
            });

            expect(updatedBikerRecord).toStrictEqual(expectedBikerRecord);

            if (reqBody.biker.foreigner) {
              const updatedPassportRecord = await Passport.findOne({
                where: { bikerId: foreignerToUpdate.id },
                raw: true,
              });

              expect(updatedPassportRecord).toStrictEqual(
                expectedPassportRecord
              );
            }
          }
        );
      });
    });
  });

  describe('/:id/confirm', () => {
    const path = (id, token) => `/api/bikers/${id}/confirm?token=${token}`;

    describe('GET', () => {
      const method = 'get';

      const creditCard = creditCardData[0];
      const biker = { ...bikerData[0], status: bikerStatus.ACTIVE };

      beforeAll(async () => {
        await truncateAllTables();
        await CreditCard.create(creditCard);
        await Biker.bulkCreate([biker]);
      });

      describe('412', () => {
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

          expect(res.status).toBe(412);
          expect(res.body).toStrictEqual({
            errorType: PRECONDITION_FAILED_ERROR,
            errors: ['Account not pending.'],
          });
        });
      });

      describe('403', () => {
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

          expect(res.status).toBe(403);
          expect(res.body).toStrictEqual({
            errorType: FORBIDDEN_ERROR,
            errors: ['Invalid email confirmation request.'],
          });
        });
      });

      describe('204', () => {
        beforeAll(() =>
          Biker.update(
            { status: bikerStatus.PENDING },
            { where: { id: biker.id } }
          )
        );

        const testCases = [
          {
            description: 'Pending account',
            path: path(
              biker.id,
              emailConfirmationToken(biker.id, EMAIL_VERIFICATION)
            ),
          },
        ];

        test.each(testCases)('$description', async ({ path }) => {
          const res = await request(app)[method](path);

          expect(res.status).toBe(204);
          expect(res.body).toStrictEqual({});
        });
      });
    });
  });

  describe('/:id/credit-cards', () => {
    const path = id => `/api/bikers/${id}/credit-cards`;

    describe('PUT', () => {
      const method = 'put';

      describe('200', () => {
        const originalCreditCard = creditCardData[0];
        const existingCreditCard = creditCardData[1];
        const biker = bikerData[0];

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.bulkCreate([originalCreditCard, existingCreditCard]);
          await Biker.bulkCreate([biker]);
        });

        const newCreditCard = creditCardData[2];

        const testCases = [
          {
            description: 'Existing credit card',
            path: path(biker.id),
            reqBody: { ...existingCreditCard, cvv: 111 },
            expectedBikerRecord: expect.objectContaining({
              ...biker,
              creditCardId: existingCreditCard.id,
            }),
            expectedCreditCardRecord:
              expect.objectContaining(existingCreditCard),
          },
          {
            description: 'New credit card',
            path: path(biker.id),
            reqBody: { ...newCreditCard, cvv: 111 },
            expectedBikerRecord: expect.objectContaining({
              ...biker,
              creditCardId: expect.any(String),
            }),
            expectedCreditCardRecord: expect.objectContaining({
              ...newCreditCard,
              id: expect.any(String),
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            path,
            reqBody,
            expectedBikerRecord,
            expectedCreditCardRecord,
          }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            expect(res.body).toStrictEqual({});
            expect(res.status).toBe(204);

            const bikerRecord = await Biker.findOne({
              where: { id: biker.id },
              raw: true,
            });
            const creditCardRecord = await CreditCard.findOne({
              include: { model: Biker, where: { id: biker.id } },
              raw: true,
            });

            expect(bikerRecord).toStrictEqual(expectedBikerRecord);
            expect(creditCardRecord).toStrictEqual(expectedCreditCardRecord);
          }
        );
      });
    });
  });

  describe('/login', () => {
    const path = '/api/bikers/login';

    describe('POST', () => {
      const method = 'post';

      const creditCard = creditCardData[0];
      const biker = bikerData[0];

      beforeAll(async () => {
        await truncateAllTables();
        await CreditCard.create(creditCard);
        await Biker.bulkCreate([biker]);
      });

      describe('401', () => {
        const testCases = [
          {
            description: 'Incorrect password',
            reqBody: { email: biker.email, password: 'abc' },
          },
        ];

        test.each(testCases)('$description', async ({ reqBody }) => {
          const res = await request(app)[method](path).send(reqBody);

          expect(res.status).toBe(401);
          expect(res.body).toStrictEqual({
            errorType: AUTHENTICATION_ERROR,
            errors: ['Incorrect credentials.'],
          });
        });
      });

      describe('200', () => {
        const testCases = [
          {
            description: 'Correct password',
            reqBody: { email: biker.email, password: 'secret' },
          },
        ];

        test.each(testCases)('$description', async ({ reqBody }) => {
          const res = await request(app)[method](path).send(reqBody);

          expect(res.status).toBe(200);
          expect(res.body).toStrictEqual({ token: expect.any(String) });

          const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);

          expect(payload.id).toBe(biker.id);
          expect(payload.purpose).toBe(ACCESS);
        });
      });
    });
  });
});
