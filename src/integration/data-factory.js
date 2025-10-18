import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

export const createBike = (bikeSerial, overrides = {}) => ({
  id: faker.string.uuid(),
  bikeSerial,
  brand: faker.vehicle.manufacturer(),
  model: faker.vehicle.model(),
  manufactureYear: 2000,
  status: undefined,
  ...overrides,
});

export const createDock = (dockSerial, overrides = {}) => ({
  id: faker.string.uuid(),
  dockSerial,
  model: faker.vehicle.model(),
  manufactureDate: '2000-06-15',
  status: undefined,
  stationId: null,
  bikeId: null,
  ...overrides,
});

export const createCreditCard = (overrides = {}) => ({
  id: faker.string.uuid(),
  creditCardNumber: faker.finance.creditCardNumber(),
  holderName: faker.person.fullName(),
  expirationDate: '06/2030',
  ...overrides,
});

export const createBiker = (foreigner, creditCardId, overrides = {}) => ({
  id: faker.string.uuid(),
  cpf: null,
  name: faker.person.fullName(),
  birthDate: '2000-06-15',
  email: faker.internet.email(),
  password: bcrypt.hashSync('secret', 10),
  foreigner,
  status: undefined,
  creditCardId,
  ...overrides,
});

export const createStation = (stationSerial, overrides = {}) => ({
  id: faker.string.uuid(),
  stationSerial,
  name: faker.location.street(),
  location: faker.location.streetAddress(),
  ...overrides,
});

export const createEmployee = (registration, cpf, role, overrides = {}) => ({
  id: faker.string.uuid(),
  registration,
  cpf,
  name: faker.person.fullName(),
  birthDate: faker.date.birthdate(),
  role,
  ...overrides,
});

export const createCharge = (bikerId, overrides = {}) => ({
  id: faker.string.uuid(),
  requestedAt: faker.date.past(),
  completedAt: null,
  amount: 10,
  bikerId,
  ...overrides,
});

export const createRental = (
  bikerId,
  bikeId,
  rentedFromDockId,
  initialChargeId,
  overrides = {}
) => ({
  id: faker.string.uuid(),
  startedAt: faker.date.past(),
  finishedAt: null,
  bikerId,
  bikeId,
  rentedFromDockId,
  returnedToDockId: null,
  initialChargeId,
  extraChargeId: null,
  ...overrides,
});
