import { INTERNAL_SERVER_ERROR } from '../../model/shared/enum/error-types.js';
import Result from '../../model/shared/result.js';
import BaseService from '../base-service.js';

export default class ChargeService extends BaseService {
  constructor( chargeRepository ) { super( chargeRepository ); }

  findIncomplete() {
    return this._modelRepository.findAllByRequestPeriodAndNullCompletionTime(
        new Date( Date.now() - 12 * 60 * 60 * 1000 ) // 12 hours ago
      );
  }
  
  complete( charge ) {
    return this.updateById( charge.id, { completedAt: Date.now() } );
  }

  calculateAdditionalAmount( startTime, now ) {
    try {
      const elapsedHours = ( now - startTime ) / ( 1000 * 60 * 60 );

      let amount = 0;
      if ( elapsedHours > 2 )
        amount = Math.ceil( ( elapsedHours - 2 ) / 0.5 ) * 5;

      return Result.success( amount );
    } catch ( error ) {
      return Result.failure( INTERNAL_SERVER_ERROR, error.message );
    }
  }
}
