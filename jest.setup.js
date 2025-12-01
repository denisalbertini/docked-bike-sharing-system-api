import { jest } from '@jest/globals';
import MockEmailService from './src/service/services/__mocks__/email-service';

jest.unstable_mockModule('./src/service/services/email-service.js', () => ({
  default: MockEmailService,
}));
