import BaseRepository from '../base-repository';
import Charge from '../../../model/sequelize/models/charge.js';
import { Op } from 'sequelize';

export default class ChargeRepository extends BaseRepository {
  constructor() { super( Charge ); }

  findAllByRequestPeriodAndNullCompletionTime( requestPeriod ) {
    return this.handleOperation(
      () => this.model.findAll(
        {
          where: {
            requestedAt: { [ Op.lte ]: requestPeriod }, 
            completedAt: { [ Op.is ]: null }
          }
        }
      )
    );
  }
}
