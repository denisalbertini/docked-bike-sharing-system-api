import BaseService from '../base-service.js';
import Result from '../../model/shared/result.js';
import { NOT_FOUND_ERROR } from '../../error-types.js';

export default class ChargeService extends BaseService {
  complete( charge ) {
    return this.updateById( charge.id, { completedAt: Date.now() } );
  }

  calculateAdditionalAmount( startTime, now ) {
    const elapsedHours = ( now - startTime ) / ( 1000 * 60 * 60 );

    if ( elapsedHours > 2 )
      return Math.ceil( ( elapsedHours - 2 ) / 0.5 ) * 5;

    return 0;
  }

  async findIncomplete() {
    const findResult =
      await this._modelRepository.findAllByRequestPeriodAndNullCompletionTime(
        new Date( Date.now() - 12 * 60 * 60 * 1000 ) // 12 hours ago
      );
    
    if ( findResult.isSuccess && findResult.value.length === 0 )
      return Result.failure( NOT_FOUND_ERROR, 'No incomplete charges left.' );

    return findResult;
  }
}
