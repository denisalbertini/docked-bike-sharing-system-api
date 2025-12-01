import { beforeAll, describe, expect, test } from '@jest/globals';
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

const headers = { authorization: `Bearer ${schedulerToken}` };

describe('/late-fees', () => {
  const path = '/api/charges/late-fees';

  describe('POST', () => {
    const method = 'post';

    describe('200', () => {
      const creditCard = createCreditCard();
      const biker = createBiker(creditCard.id, { cpf: '23847541064' });

      const moreThan12HoursAgoCharge = createCharge(biker.id, {
        requestedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 13),
      });

      const lessThan12HoursAgoCharge1 = createCharge(biker.id, {
        requestedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 11),
      });
      const lessThan12HoursAgoCharge2 = createCharge(biker.id, {
        requestedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 1),
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
              completedAt: expect.any(Date),
              amount: lessThan12HoursAgoCharge1.amount.toFixed(2),
            },
            {
              ...lessThan12HoursAgoCharge2,
              requestedAt: new Date(lessThan12HoursAgoCharge2.requestedAt),
              completedAt: expect.any(Date),
              amount: lessThan12HoursAgoCharge2.amount.toFixed(2),
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
          expect(unchangedChargeRecord.toJSON()).toStrictEqual(
            expectedUnchangedRecord
          );
          expect(
            completedCharges
              .map(c => c.toJSON())
              .sort((a, b) => a.requestedAt.getTime() < b.requestedAt.getTime())
          ).toStrictEqual(expectedCompleted);
        }
      );
    });
  });
});
