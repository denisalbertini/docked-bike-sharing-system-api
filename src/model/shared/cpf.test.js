import { describe, expect, test } from '@jest/globals';
import Cpf from './cpf.js';

describe('CPF Validation', () => {
  test('should validate a correct CPF', () => {
    expect(Cpf.validate('11144477735')).toBe(true);
  });

  test('should reject invalid CPF with incorrect first digit', () => {
    expect(Cpf.validate('11144477736')).toBe(false);
  });

  test('should reject invalid CPF with incorrect second digit', () => {
    expect(Cpf.validate('11144477734')).toBe(false);
  });

  test('should reject CPF with all identical digits', () => {
    expect(Cpf.validate('11111111111')).toBe(false);
  });

  test('should reject CPF with incorrect length shorter', () => {
    expect(Cpf.validate('1234567890')).toBe(false);
  });

  test('should reject CPF with incorrect length longer', () => {
    expect(Cpf.validate('123456789012')).toBe(false);
  });

  test('should reject empty string', () => {
    expect(Cpf.validate('')).toBe(false);
  });

  test('should validate another correct CPF', () => {
    expect(Cpf.validate('12345678909')).toBe(true);
  });

  test('should reject CPF with non-digit characters', () => {
    expect(Cpf.validate('123.456.789-09')).toBe(false);
  });
});
