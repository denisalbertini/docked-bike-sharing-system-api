import { beforeAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import app from '../../express/app.js';
import Bike from '../../model/models/bike';
import Biker from '../../model/models/biker';
import Charge from '../../model/models/charge';
import CreditCard from '../../model/models/credit-card';
import Dock from '../../model/models/dock';
import Rental from '../../model/models/rental.js';
import Station from '../../model/models/station.js';
import bikeStatus from '../../model/shared/enum/bike-status.js';
import dockStatus from '../../model/shared/enum/dock-status.js';
import { BAD_REQUEST_ERROR } from '../../model/shared/enum/error-types';
import {
  createBike,
  createBiker,
  createCharge,
  createCreditCard,
  createDock,
  createRental,
  createStation,
} from '../data-factory';
import { bikerToken } from '../tokens';
import truncateAllTables from '../truncate-tables.js';

const headers = { authorization: `Bearer ${bikerToken}` };

describe('/api/rentals', () => {
  describe('/', () => {
    const path = '/api/rentals';

    describe('POST', () => {
      const method = 'post';

      describe('400', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, { cpf: '97375827052' });
        const bike = createBike();
        const dock = createDock();
        const charge = createCharge(biker.id);
        const rental = createRental(biker.id, bike.id, dock.id, charge.id);

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.create(biker);
          await Bike.create(bike);
          await Dock.create(dock);
          await Charge.create(charge);
          await Rental.create(rental);
        });

        const testCases = [
          {
            description: 'Invalid status',
            reqBody: {
              bikerId: biker.id,
              bikeSerial: bike.bikeSerial,
              dockSerial: dock.dockSerial,
            },
            expectedErrors: [
              'Biker is already renting.',
              'Dock is not OCCUPIED.',
              'Bike is not AVAILABLE.',
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
              errorType: BAD_REQUEST_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(400);
          }
        );
      });

      describe('201', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, { cpf: '97375827052' });
        const bike = createBike({ status: bikeStatus.AVAILABLE });
        const station = createStation();
        const dock = createDock({
          status: dockStatus.OCCUPIED,
          stationId: station.id,
        });

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.create(biker);
          await Bike.bulkCreate([bike]);
          await Station.create(station);
          await Dock.bulkCreate([dock]);
        });

        const testCases = [
          {
            description: 'Record created',
            reqBody: {
              bikerId: biker.id,
              bikeSerial: bike.bikeSerial,
              dockSerial: dock.dockSerial,
            },
            expectedResBody: {
              id: expect.any(String),
              startedAt: expect.any(String),
              finishedAt: null,
              bikerId: biker.id,
              bikeId: bike.id,
              rentedFromDockId: dock.id,
              returnedToDockId: null,
              initialChargeId: expect.any(String),
              extraChargeId: null,
            },
            expectedBikeRecord: {
              ...bike,
              status: bikeStatus.RENTED,
              deletedAt: null,
            },
            expectedDockRecord: {
              ...dock,
              status: dockStatus.AVAILABLE,
              deletedAt: null,
            },
            expectedRentalRecord: expect.objectContaining({
              id: expect.any(String),
              startedAt: expect.any(Date),
              finishedAt: null,
              bikerId: biker.id,
              bikeId: bike.id,
              rentedFromDockId: dock.id,
              returnedToDockId: null,
              initialChargeId: expect.any(String),
              extraChargeId: null,
              'initialCharge.id': expect.any(String),
              'initialCharge.requestedAt': expect.any(Date),
              'initialCharge.completedAt': expect.any(Date),
              'initialCharge.amount': '10.00',
              'initialCharge.bikerId': biker.id,
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            reqBody,
            expectedResBody,
            expectedBikeRecord,
            expectedDockRecord,
            expectedRentalRecord,
          }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            const bikeRecord = await Bike.findByPk(expectedResBody.bikeId, {
              raw: true,
            });
            const dockRecord = await Dock.findByPk(
              expectedResBody.rentedFromDockId,
              {
                raw: true,
              }
            );
            const rentalRecord = await Rental.findOne({
              where: {
                bikerId: expectedResBody.bikerId,
                bikeId: expectedResBody.bikeId,
                rentedFromDockId: expectedResBody.rentedFromDockId,
              },
              include: { model: Charge, as: 'initialCharge' },
              raw: true,
            });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(201);
            expect(bikeRecord).toStrictEqual(expectedBikeRecord);
            expect(dockRecord).toStrictEqual(expectedDockRecord);
            expect(rentalRecord).toStrictEqual(expectedRentalRecord);
          }
        );
      });
    });
  });

  describe('/return', () => {
    const path = '/api/rentals/return';

    describe('POST', () => {
      const method = 'post';

      describe('400', () => {
        const bike = createBike();
        const dock = createDock();

        beforeAll(async () => {
          await truncateAllTables();
          await Bike.create(bike);
          await Dock.create(dock);
        });

        const testCases = [
          {
            description: 'Invalid status',
            reqBody: {
              bikeSerial: bike.bikeSerial,
              dockSerial: dock.dockSerial,
            },
            expectedErrors: ['Bike is not RENTED.', 'Dock is not AVAILABLE.'],
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
              errorType: BAD_REQUEST_ERROR,
              errors: expectedErrors,
            });
            expect(res.status).toBe(400);
          }
        );
      });

      describe('200', () => {
        const creditCard = createCreditCard();
        const biker = createBiker(creditCard.id, { cpf: '97375827052' });
        const charge = createCharge(biker.id);

        const station = createStation();

        const bike1 = createBike({ status: bikeStatus.RENTED });
        const dock1 = createDock({
          status: dockStatus.AVAILABLE,
          stationId: station.id,
        });
        const insideTimeLimitRental = createRental(
          biker.id,
          bike1.id,
          dock1.id,
          charge.id,
          {
            startedAt: new Date(Date.now() - 1.89 * 60 * 60 * 1000),
          }
        );

        const bike2 = createBike({ status: bikeStatus.RENTED });
        const dock2 = createDock({
          status: dockStatus.AVAILABLE,
          stationId: station.id,
        });
        const outsideTimeLimitRental = createRental(
          biker.id,
          bike2.id,
          dock2.id,
          charge.id,
          {
            startedAt: new Date(Date.now() - 2.67 * 60 * 60 * 1000),
          }
        );

        beforeAll(async () => {
          await truncateAllTables();
          await CreditCard.create(creditCard);
          await Biker.create(biker);
          await Station.create(station);
          await Bike.bulkCreate([bike1, bike2]);
          await Dock.bulkCreate([dock1, dock2]);
          await Charge.create(charge);
          await Rental.bulkCreate([
            insideTimeLimitRental,
            outsideTimeLimitRental,
          ]);
        });

        const testCases = [
          {
            description: 'Inside time limit',
            reqBody: {
              bikeSerial: bike1.bikeSerial,
              dockSerial: dock1.dockSerial,
            },
            expectedResBody: {
              ...insideTimeLimitRental,
              startedAt: insideTimeLimitRental.startedAt.toISOString(),
              finishedAt: expect.any(String),
              returnedToDockId: dock1.id,
            },
            expectedBikeRecord: {
              ...bike1,
              status: bikeStatus.AVAILABLE,
              deletedAt: null,
            },
            expectedDockRecord: {
              ...dock1,
              status: dockStatus.OCCUPIED,
              deletedAt: null,
            },
            expectedRentalRecord: expect.objectContaining({
              id: expect.any(String),
              startedAt: expect.any(Date),
              finishedAt: expect.any(Date),
              bikerId: biker.id,
              bikeId: bike1.id,
              rentedFromDockId: dock1.id,
              returnedToDockId: dock1.id,
              initialChargeId: expect.any(String),
              extraChargeId: null,
              'extraCharge.id': null,
              'extraCharge.requestedAt': null,
              'extraCharge.completedAt': null,
              'extraCharge.amount': null,
              'extraCharge.bikerId': null,
            }),
          },
          {
            description: 'Outside time limit',
            reqBody: {
              bikeSerial: bike2.bikeSerial,
              dockSerial: dock2.dockSerial,
            },
            expectedResBody: {
              ...outsideTimeLimitRental,
              startedAt: outsideTimeLimitRental.startedAt.toISOString(),
              finishedAt: expect.any(String),
              returnedToDockId: dock2.id,
              extraChargeId: expect.any(String),
            },
            expectedBikeRecord: {
              ...bike2,
              status: bikeStatus.AVAILABLE,
              deletedAt: null,
            },
            expectedDockRecord: {
              ...dock2,
              status: dockStatus.OCCUPIED,
              deletedAt: null,
            },
            expectedRentalRecord: expect.objectContaining({
              id: expect.any(String),
              startedAt: expect.any(Date),
              finishedAt: expect.any(Date),
              bikerId: biker.id,
              bikeId: bike2.id,
              rentedFromDockId: dock2.id,
              returnedToDockId: dock2.id,
              initialChargeId: expect.any(String),
              extraChargeId: expect.any(String),
              'extraCharge.id': expect.any(String),
              'extraCharge.requestedAt': expect.any(Date),
              'extraCharge.completedAt': expect.any(Date),
              'extraCharge.amount': '10.00',
              'extraCharge.bikerId': biker.id,
            }),
          },
        ];

        test.each(testCases)(
          '$description',
          async ({
            reqBody,
            expectedResBody,
            expectedBikeRecord,
            expectedDockRecord,
            expectedRentalRecord,
          }) => {
            const res = await request(app)
              [method](path)
              .set(headers)
              .send(reqBody);

            const bikeRecord = await Bike.findByPk(expectedResBody.bikeId, {
              raw: true,
            });
            const dockRecord = await Dock.findByPk(
              expectedResBody.rentedFromDockId,
              {
                raw: true,
              }
            );
            const rentalRecord = await Rental.findOne({
              where: {
                bikerId: expectedResBody.bikerId,
                bikeId: expectedResBody.bikeId,
                rentedFromDockId: expectedResBody.rentedFromDockId,
              },
              include: { model: Charge, as: 'extraCharge' },
              raw: true,
            });

            expect(res.body).toStrictEqual(expectedResBody);
            expect(res.status).toBe(200);
            expect(bikeRecord).toStrictEqual(expectedBikeRecord);
            expect(dockRecord).toStrictEqual(expectedDockRecord);
            expect(rentalRecord).toStrictEqual(expectedRentalRecord);
            expect(rentalRecord).toStrictEqual(expectedRentalRecord);
          }
        );
      });
    });
  });
});
