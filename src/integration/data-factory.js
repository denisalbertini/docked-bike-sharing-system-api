import { faker } from '@faker-js/faker';

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

export const createStation = (stationSerial, overrides = {}) => ({
  id: faker.string.uuid(),
  stationSerial,
  name: faker.string.sample(),
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
