import {
  afterAll,
  beforeAll,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import ExpirationDateValidator from './expiration-date-validator';

const validator = new ExpirationDateValidator();

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-05-15T03:00:00Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('ExpirationDateValidator', () => {
  describe('format validation', () => {
    test('should return false for invalid format', () => {
      expect(validator.validate('2024-5-15')).toBe(false);
      expect(validator.validate('2024-05-5')).toBe(false);
      expect(validator.validate('24-05-15')).toBe(false);
      expect(validator.validate('2024/05/15')).toBe(false);
      expect(validator.validate('invalid-date')).toBe(false);
    });

    test('should return true for valid format', () => {
      expect(validator.validate('2024-05-15')).toBe(true);
    });
  });

  describe('month and day range validation', () => {
    test('should return false for invalid month', () => {
      expect(validator.validate('2024-00-15')).toBe(false);
      expect(validator.validate('2024-13-15')).toBe(false);
    });

    test('should return false for invalid day', () => {
      expect(validator.validate('2024-05-00')).toBe(false);
      expect(validator.validate('2024-05-32')).toBe(false);
    });
  });

  describe('calendar date validation', () => {
    test('should return false for non-existent dates', () => {
      expect(validator.validate('2027-02-29')).toBe(false); // Not a leap year
      expect(validator.validate('2028-04-31')).toBe(false); // April has 30 days
    });

    test('should accept valid calendar dates', () => {
      expect(validator.validate('2028-02-29')).toBe(true); // Leap year
      expect(validator.validate('2028-04-30')).toBe(true); // Valid end of month
    });
  });

  describe('expiration check', () => {
    test('should return false for past years', () => {
      expect(validator.validate('2023-05-15')).toBe(false);
    });

    test('should return false for past months in current year', () => {
      expect(validator.validate('2024-04-15')).toBe(false);
    });

    test('should return true for current month', () => {
      expect(validator.validate('2024-05-15')).toBe(true);
    });

    test('should return true for future months', () => {
      expect(validator.validate('2024-06-15')).toBe(true);
    });

    test('should return true for future years', () => {
      expect(validator.validate('2025-05-15')).toBe(true);
    });
  });
});
