import { faker } from '@faker-js/faker';
import RandExp from 'randexp';
import employeeRole from '../model/shared/enum/employee-role';

export const createBike = (overrides = {}) => ({
  id: faker.string.uuid(),
  bikeSerial: RandExp.randexp(/BI-\d{3}/),
  brand: faker.vehicle.manufacturer(),
  model: faker.vehicle.model(),
  manufactureYear: 2000,
  status: undefined,
  ...overrides,
});

export const createDock = (overrides = {}) => ({
  id: faker.string.uuid(),
  dockSerial: RandExp.randexp(/DO-\d{3}/),
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
  expirationDate: RandExp.randexp(/(0[1-9]|1[0-2])\/(2[6-9]|[3-9][0-9])/),
  cvv: RandExp.randexp(/\d{3}/),
  ...overrides,
});

export const createBiker = (creditCardId, overrides = {}) => ({
  id: faker.string.uuid(),
  cpf: null,
  name: faker.person.fullName(),
  birthDate: '2000-06-15',
  email: faker.internet.email(),
  password: RandExp.randexp(/\$2[aby]\$10\$[./A-Za-z0-9]{53}/),
  status: undefined,
  creditCardId,
  ...overrides,
});

export const createPassport = (bikerId, overrides = {}) => ({
  id: faker.string.uuid(),
  passportNumber: RandExp.randexp(/[A-Za-z0-9]{6,9}/),
  expirationDate: '2030-06-15',
  countryCode: RandExp.randexp(/\b[A-Z]{3}\b/),
  bikerId,
  ...overrides,
});

export const createStation = (overrides = {}) => ({
  id: faker.string.uuid(),
  stationSerial: RandExp.randexp(/ST-\d{3}/),
  name: faker.location.street(),
  location: faker.location.streetAddress(),
  ...overrides,
});

export const createEmployee = (cpf, overrides = {}) => ({
  id: faker.string.uuid(),
  registration: RandExp.randexp(/EM-\d{3}/),
  cpf,
  name: faker.person.fullName(),
  birthDate: '2000-06-15',
  role: faker.helpers.objectValue(employeeRole),
  ...overrides,
});

export const createCharge = (bikerId, overrides = {}) => ({
  id: faker.string.uuid(),
  requestedAt: faker.date.past(),
  completedAt: null,
  amount: faker.number.float({ fractionDigits: 2 }),
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
