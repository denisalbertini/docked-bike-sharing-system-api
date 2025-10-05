import BaseService from '../base-service.js';

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
}
