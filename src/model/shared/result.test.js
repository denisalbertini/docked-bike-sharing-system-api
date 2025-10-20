import { describe, expect, test } from '@jest/globals';
import {
  FOREIGN_KEY_CONSTRAINT_ERROR,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND_ERROR,
  PRECONDITION_FAILED_ERROR,
  UNIQUE_CONSTRAINT_ERROR,
  VALIDATION_ERROR,
} from './enum/error-types.js';
import Result from './result.js';

describe('Result', () => {
  describe('Constructor', () => {
    test('should throw error when using new operator directly', () => {
      expect(() => new Result()).toThrow(
        'Do not use the "new" operator to instantiate Result. Use the static "success" and "failure" methods instead.'
      );
    });
  });

  describe('Success Result', () => {
    test('should create successful result with default null value', () => {
      const result = Result.success();

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBeNull();
      expect(result.errors).toBeNull();
      expect(result.errorType).toBeNull();
    });

    test('should create successful result with provided value', () => {
      const testValue = { data: 'test' };
      const result = Result.success(testValue);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe(testValue);
      expect(result.errors).toBeNull();
      expect(result.errorType).toBeNull();
    });
  });

  describe('Failure Result', () => {
    test('should create failure result with single error', () => {
      const error = 'Something went wrong';
      const result = Result.failure(VALIDATION_ERROR, error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.value).toBeNull();
      expect(result.errors).toEqual([error]);
      expect(result.errorType).toBe(VALIDATION_ERROR);
    });

    test('should create failure result with multiple errors', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const result = Result.failure(NOT_FOUND_ERROR, ...errors);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.value).toBeNull();
      expect(result.errors).toEqual(errors);
      expect(result.errorType).toBe(NOT_FOUND_ERROR);
    });
  });

  describe('Merge Failures', () => {
    test('should merge multiple failures and prioritize VALIDATION_ERROR', () => {
      const failures = [
        Result.failure(INTERNAL_SERVER_ERROR, 'Internal error'),
        Result.failure(VALIDATION_ERROR, 'Validation failed'),
        Result.failure(NOT_FOUND_ERROR, 'Not found'),
      ];

      const merged = Result.mergeFailures(failures);

      expect(merged.isFailure).toBe(true);
      expect(merged.errorType).toBe(VALIDATION_ERROR);
      expect(merged.errors).toEqual([
        'Internal error',
        'Validation failed',
        'Not found',
      ]);
    });

    test('should prioritize NOT_FOUND_ERROR when no VALIDATION_ERROR present', () => {
      const failures = [
        Result.failure(UNIQUE_CONSTRAINT_ERROR, 'Duplicate'),
        Result.failure(NOT_FOUND_ERROR, 'Missing resource'),
        Result.failure(FOREIGN_KEY_CONSTRAINT_ERROR, 'Foreign key violation'),
      ];

      const merged = Result.mergeFailures(failures);

      expect(merged.errorType).toBe(NOT_FOUND_ERROR);
    });

    test('should prioritize UNIQUE_CONSTRAINT_ERROR appropriately', () => {
      const failures = [
        Result.failure(PRECONDITION_FAILED_ERROR, 'Precondition failed'),
        Result.failure(UNIQUE_CONSTRAINT_ERROR, 'Duplicate entry'),
      ];

      const merged = Result.mergeFailures(failures);

      expect(merged.errorType).toBe(UNIQUE_CONSTRAINT_ERROR);
    });

    test('should use INTERNAL_SERVER_ERROR as fallback', () => {
      const merged = Result.mergeFailures([]);

      expect(merged.errorType).toBe(INTERNAL_SERVER_ERROR);
    });

    test('should handle empty failures array', () => {
      const merged = Result.mergeFailures([]);

      expect(merged.isFailure).toBe(true);
      expect(merged.errorType).toBe(INTERNAL_SERVER_ERROR);
      expect(merged.errors).toEqual([]);
    });

    test('should maintain error order from multiple failures', () => {
      const failures = [
        Result.failure(VALIDATION_ERROR, 'First error'),
        Result.failure(NOT_FOUND_ERROR, 'Second error'),
        Result.failure(UNIQUE_CONSTRAINT_ERROR, 'Third error'),
      ];

      const merged = Result.mergeFailures(failures);

      expect(merged.errors).toEqual([
        'First error',
        'Second error',
        'Third error',
      ]);
    });
  });

  describe('Immutable Properties', () => {
    test('should not allow modification of success result properties', () => {
      const result = Result.success('test');

      expect(() => {
        result.value = 'modified';
      }).toThrow();
      expect(() => {
        result.errors = [];
      }).toThrow();
      expect(() => {
        result.errorType = 'ERROR';
      }).toThrow();
    });

    test('should not allow modification of failure result properties', () => {
      const result = Result.failure(VALIDATION_ERROR, 'error');

      expect(() => {
        result.value = 'modified';
      }).toThrow();
      expect(() => {
        result.errors = [];
      }).toThrow();
      expect(() => {
        result.errorType = 'OTHER_ERROR';
      }).toThrow();
    });
  });
});
