import BaseRepository from '../base-repository.js';
import Charge from '../../model/models/charge.js';
import { Op } from 'sequelize';

export default class ChargeRepository extends BaseRepository {
  constructor() { super( Charge ); }

  findAllByRequestPeriodAndNullCompletionTime( requestPeriod ) {
    return this._handleOperation(
      () => this._model.findAll(
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
