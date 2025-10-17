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
    const elapsedHours = ( now - startTime ) / ( 1000 * 60 * 60 );

    if ( elapsedHours > 2 )
      return Math.ceil( ( elapsedHours - 2 ) / 0.5 ) * 5;

    return 0;
  }
}
