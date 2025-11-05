import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';
import BirthDateValidator from './birth-date-validator';

const validator = new BirthDateValidator();

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2023-06-15T00:00:00-03:00'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('BirthDateValidator', () => {
  describe('format validation', () => {
    test('should reject non-YYYY-MM-DD formats', () => {
      expect(validator.validate('15/06/2023', 18, 100)).toBe(false);
      expect(validator.validate('2023/06/15', 18, 100)).toBe(false);
      expect(validator.validate('20230615', 18, 100)).toBe(false);
      expect(validator.validate('2023-6-5', 18, 100)).toBe(false);
    });

    test('should accept valid YYYY-MM-DD format', () => {
      expect(validator.validate('2000-06-15', 18, 100)).toBe(true);
    });
  });

  describe('range validation', () => {
    test('should reject months > 12', () => {
      expect(validator.validate('2000-13-15', 18, 100)).toBe(false);
    });

    test('should reject months < 1', () => {
      expect(validator.validate('2000-00-15', 18, 100)).toBe(false);
    });

    test('should reject days > 31', () => {
      expect(validator.validate('2000-06-32', 18, 100)).toBe(false);
    });

    test('should reject days < 1', () => {
      expect(validator.validate('2000-06-00', 18, 100)).toBe(false);
    });
  });

  describe('invalid date validation', () => {
    test('should reject invalid dates', () => {
      expect(validator.validate('2023-02-29', 18, 100)).toBe(false); // Non-leap year
      expect(validator.validate('2023-04-31', 18, 100)).toBe(false); // April has 30 days
    });

    test('should accept valid dates', () => {
      expect(validator.validate('2020-02-29', 0, 100)).toBe(true); // Leap year
      expect(validator.validate('2023-04-30', 0, 100)).toBe(true); // Valid day for April
    });
  });

  describe('age calculation', () => {
    test('should calculate age correctly before birthday', () => {
      // Date: 2023-06-15, Person born 2005-06-16 (turns 18 tomorrow)
      expect(validator.validate('2005-06-16', 18, 100)).toBe(false);
    });

    test('should calculate age correctly after birthday', () => {
      // Date: 2023-06-15, Person born 2005-06-14 (turned 18 yesterday)
      expect(validator.validate('2005-06-14', 18, 100)).toBe(true);
    });

    test('should calculate age correctly on birthday', () => {
      // Date: 2023-06-15, Person born 2005-06-15 (turns 18 today)
      expect(validator.validate('2005-06-15', 18, 100)).toBe(true);
    });
  });

  describe('age boundary tests', () => {
    test('should reject ages below minimum', () => {
      expect(validator.validate('2010-06-15', 18, 100)).toBe(false); // 13 years old
    });

    test('should reject ages above maximum', () => {
      expect(validator.validate('1920-06-15', 18, 100)).toBe(false); // 103 years old
    });

    test('should accept ages at minimum boundary', () => {
      expect(validator.validate('2005-06-15', 18, 100)).toBe(true); // Exactly 18
    });

    test('should accept ages at maximum boundary', () => {
      expect(validator.validate('1923-06-15', 18, 100)).toBe(true); // Exactly 100
    });
  });

  describe('edge cases', () => {
    test('should handle leap years correctly', () => {
      // Set date to 2024-02-28 (leap year)
      jest.setSystemTime(new Date('2024-02-28T00:00:00-03:00'));
      expect(validator.validate('2004-02-29', 18, 100)).toBe(true); // Valid leap year birth

      // Test next day in leap year
      jest.setSystemTime(new Date('2024-02-29T00:00:00-03:00'));
      expect(validator.validate('2004-02-29', 20, 100)).toBe(true); // Exactly 20 on leap day
    });

    test('should handle different month transitions', () => {
      // Test month boundary (January to February)
      jest.setSystemTime(new Date('2023-02-01T00:00:00-03:00'));
      expect(validator.validate('2005-01-31', 18, 100)).toBe(true);
    });
  });
});
