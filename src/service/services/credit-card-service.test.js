import { beforeEach, describe, expect, test } from '@jest/globals';
import CreditCardService from './credit-card-service.js';

describe('CreditCardService', () => {
  let creditCardService;
  const mockRepository = {};

  beforeEach(() => {
    creditCardService = new CreditCardService(mockRepository);
  });

  describe('validate', () => {
    test('should return success for valid credit card data', () => {
      const validData = {
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '12/28',
        cvv: '123',
      };

      const result = creditCardService.validate(validData);

      expect(result.isSuccess).toBe(true);
    });

    test('should return validation error for invalid credit card number', () => {
      const invalidData = {
        creditCardNumber: '4111111111111112',
        creditCardExpirationDate: '12/28',
        cvv: '123',
      };

      const result = creditCardService.validate(invalidData);

      expect(result.isFailure).toBe(true);
      expect(result.errorType).toBe('VALIDATION_ERROR');
      expect(result.errors).toContain('Invalid credit card number.');
    });

    test('should return validation error for expired card', () => {
      const expiredData = {
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '01/20',
        cvv: '123',
      };

      const result = creditCardService.validate(expiredData);

      expect(result.isFailure).toBe(true);
      expect(result.errors).toContain('Invalid credit card expiration date.');
    });

    test('should return validation error for invalid CVV', () => {
      const invalidCvvData = {
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '12/28',
        cvv: '12',
      };

      const result = creditCardService.validate(invalidCvvData);

      expect(result.isFailure).toBe(true);
      expect(result.errors).toContain('Invalid credit card cvv.');
    });

    test('should return multiple errors for multiple invalid fields', () => {
      const invalidData = {
        creditCardNumber: '4111111111111112',
        creditCardExpirationDate: '13/28',
        cvv: '1',
      };

      const result = creditCardService.validate(invalidData);

      expect(result.isFailure).toBe(true);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Invalid credit card number.');
      expect(result.errors).toContain('Invalid credit card expiration date.');
      expect(result.errors).toContain('Invalid credit card cvv.');
    });

    test('should handle different valid credit card numbers', () => {
      const validCards = [
        '5555555555554444', // MasterCard
        '4012888888881881', // Visa
        '378282246310005', // American Express
      ];

      validCards.forEach(creditCardNumber => {
        const data = {
          creditCardNumber,
          creditCardExpirationDate: '12/28',
          cvv: '123',
        };

        const result = creditCardService.validate(data);
        expect(result.isSuccess).toBe(true);
      });
    });

    test('should handle credit card number with spaces and dashes', () => {
      const data = {
        creditCardNumber: '4111-1111-1111-1111',
        creditCardExpirationDate: '12/28',
        cvv: '123',
      };

      const result = creditCardService.validate(data);

      expect(result.isSuccess).toBe(true);
    });

    test('should validate 4-digit CVV for American Express', () => {
      const data = {
        creditCardNumber: '378282246310005',
        creditCardExpirationDate: '12/28',
        cvv: '1234',
      };

      const result = creditCardService.validate(data);

      expect(result.isSuccess).toBe(true);
    });

    test('should reject invalid expiration date format', () => {
      const invalidFormats = ['12-28', '1228', '12/2028', '12/'];

      invalidFormats.forEach(creditCardExpirationDate => {
        const data = {
          creditCardNumber: '4111111111111111',
          creditCardExpirationDate,
          cvv: '123',
        };

        const result = creditCardService.validate(data);
        expect(result.isFailure).toBe(true);
        expect(result.errors).toContain('Invalid credit card expiration date.');
      });
    });

    test('should reject invalid month in expiration date', () => {
      const data = {
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '13/28',
        cvv: '123',
      };

      const result = creditCardService.validate(data);

      expect(result.isFailure).toBe(true);
      expect(result.errors).toContain('Invalid credit card expiration date.');
    });

    test('should reject non-numeric CVV', () => {
      const data = {
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '12/28',
        cvv: '12a',
      };

      const result = creditCardService.validate(data);

      expect(result.isFailure).toBe(true);
      expect(result.errors).toContain('Invalid credit card cvv.');
    });
  });
});
