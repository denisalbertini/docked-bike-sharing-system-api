import { beforeAll, describe, expect, jest, test } from '@jest/globals';
import { Op } from 'sequelize';
import request from 'supertest';
import app from '../../express/app.js';
import Biker from '../../model/models/biker';
import Charge from '../../model/models/charge';
import CreditCard from '../../model/models/credit-card';
import { bikerData, chargeData, creditCardData } from '../test-data';
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
      const creditCard = creditCardData[0];
      const biker = bikerData[0];
      const moreThan12HoursAgoCharge = chargeData[0];
      const lessThan12HoursAgoCharges = chargeData.slice(1, 3);

      beforeAll(async () => {
        await truncateAllTables();
        await CreditCard.create(creditCard);
        await Biker.bulkCreate([biker]);
        await Charge.bulkCreate(chargeData.slice(0, 3));
      });

      const testCases = [{ description: 'Success' }];

      test.each(testCases)('$description', async () => {
        const res = await request(app)[method](path).set(headers);

        expect(res.status).toBe(204);
        expect(res.body).toStrictEqual({});

        const unchangedChargeRecord = await Charge.findOne({
          where: { id: moreThan12HoursAgoCharge.id },
        });
        const completedCharges = await Charge.findAll({
          where: {
            id: { [Op.in]: lessThan12HoursAgoCharges.map(c => c.id) },
          },
        });

        expect(unchangedChargeRecord).toStrictEqual(
          expect.objectContaining({
            id: moreThan12HoursAgoCharge.id,
            requestedAt: new Date(moreThan12HoursAgoCharge.requestedAt),
            completedAt: new Date(moreThan12HoursAgoCharge.completedAt),
          })
        );

        expect(completedCharges).toStrictEqual(
          expect.arrayContaining(
            lessThan12HoursAgoCharges.map(c =>
              expect.objectContaining({
                id: c.id,
                requestedAt: new Date(c.requestedAt),
                completedAt: fakeDate,
              })
            )
          )
        );
      });
    });
  });
});
