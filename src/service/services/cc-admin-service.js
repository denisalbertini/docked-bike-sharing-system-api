import Result from '../../model/shared/result';

export default class CCAdminService {
  processPayment( _charge ) {
    // Mocks the CC Administrator
    return Result.success();
  }
}
