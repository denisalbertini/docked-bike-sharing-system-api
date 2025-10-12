import Result from '../../model/shared/result.js';

export default class CCAdminService {
  processPayment( _charge ) {
    // Mocks the CC Administrator
    return Result.success();
  }
}
