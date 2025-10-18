import { beforeAll, describe, expect, jest, test } from '@jest/globals';
import { Op } from 'sequelize';
import request from 'supertest';
import app from '../../express/app.js';
import Biker from '../../model/models/biker';
import Charge from '../../model/models/charge';
import CreditCard from '../../model/models/credit-card';
import {
  createBiker,
  createCharge,
  createCreditCard,
} from '../data-factory.js';
import { schedulerToken } from '../tokens';
import truncateAllTables from '../truncate-tables.js';

const fakeDate = new Date('2024-01-15T14:30:00-03:00');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(fakeDate);
});

afterAll(() => {
  jest.useRealTimers();
});

const headers = { authorization: `Bearer ${schedulerToken}` };

describe('/late-fees', () => {
  const path = '/api/charges/late-fees';

  describe('POST', () => {
    const method = 'post';

    describe('200', () => {
      const creditCard = createCreditCard();
      const biker = createBiker(false, creditCard.id, { cpf: '23847541064' });

      const moreThan12HoursAgoCharge = createCharge(biker.id, {
        requestedAt: '2024-01-14T20:30:00-03:00',
      });

      const lessThan12HoursAgoCharge1 = createCharge(biker.id, {
        requestedAt: '2024-01-15T11:30:00-03:00',
      });
      const lessThan12HoursAgoCharge2 = createCharge(biker.id, {
        requestedAt: '2024-01-15T13:30:00-03:00',
      });

      beforeAll(async () => {
        await truncateAllTables();
        await CreditCard.create(creditCard);
        await Biker.bulkCreate([biker]);
        await Charge.bulkCreate([
          moreThan12HoursAgoCharge,
          lessThan12HoursAgoCharge1,
          lessThan12HoursAgoCharge2,
        ]);
      });

      const testCases = [
        {
          description: 'Success',
          expectedUnchangedRecord: {
            ...moreThan12HoursAgoCharge,
            requestedAt: new Date(moreThan12HoursAgoCharge.requestedAt),
            completedAt: null,
            amount: moreThan12HoursAgoCharge.amount.toFixed(2),
          },
          expectedCompleted: [
            {
              ...lessThan12HoursAgoCharge1,
              requestedAt: new Date(lessThan12HoursAgoCharge1.requestedAt),
              completedAt: fakeDate,
              amount: moreThan12HoursAgoCharge.amount.toFixed(2),
            },
            {
              ...lessThan12HoursAgoCharge2,
              requestedAt: new Date(lessThan12HoursAgoCharge2.requestedAt),
              completedAt: fakeDate,
              amount: moreThan12HoursAgoCharge.amount.toFixed(2),
            },
          ],
        },
      ];

      test.each(testCases)(
        '$description',
        async ({ expectedUnchangedRecord, expectedCompleted }) => {
          const res = await request(app)[method](path).set(headers);

          const unchangedChargeRecord = await Charge.findOne({
            where: { id: expectedUnchangedRecord.id },
          });
          const completedCharges = await Charge.findAll({
            where: { id: { [Op.in]: expectedCompleted.map(c => c.id) } },
          });

          expect(res.status).toBe(204);
          expect(res.body).toStrictEqual({});
          expect(unchangedChargeRecord.dataValues).toStrictEqual(
            expectedUnchangedRecord
          );
          expect(completedCharges.map(c => c.dataValues)).toStrictEqual(
            expectedCompleted
          );
        }
      );
    });
  });
});
