import { jest } from '@jest/globals';
import Result from '../../../model/shared/result.js';

export default class MockEmailService {
  constructor() {
    this.sendAccountConfirmation = jest
      .fn()
      .mockResolvedValue(Result.success());

    this.sendRentalConfirmation = jest.fn().mockResolvedValue(Result.success());
  }
}
