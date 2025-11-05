import { describe, expect, test } from '@jest/globals';
import CpfValidator from './cpf-validator.js';

const cpfValidator = new CpfValidator();

describe('CPF Validation', () => {
  test('should validate a correct CPF', () => {
    expect(cpfValidator.validate('11144477735')).toBe(true);
  });

  test('should reject invalid CPF with incorrect first digit', () => {
    expect(cpfValidator.validate('11144477736')).toBe(false);
  });

  test('should reject invalid CPF with incorrect second digit', () => {
    expect(cpfValidator.validate('11144477734')).toBe(false);
  });

  test('should reject CPF with all identical digits', () => {
    expect(cpfValidator.validate('11111111111')).toBe(false);
  });

  test('should reject CPF with incorrect length shorter', () => {
    expect(cpfValidator.validate('1234567890')).toBe(false);
  });

  test('should reject CPF with incorrect length longer', () => {
    expect(cpfValidator.validate('123456789012')).toBe(false);
  });

  test('should reject empty string', () => {
    expect(cpfValidator.validate('')).toBe(false);
  });

  test('should validate another correct CPF', () => {
    expect(cpfValidator.validate('12345678909')).toBe(true);
  });

  test('should reject CPF with non-digit characters', () => {
    expect(cpfValidator.validate('123.456.789-09')).toBe(false);
  });
});
