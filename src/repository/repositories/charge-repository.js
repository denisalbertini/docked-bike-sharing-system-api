import { Op } from 'sequelize';
import Charge from '../../model/models/charge.js';
import BaseRepository from '../base-repository.js';

export default class ChargeRepository extends BaseRepository {
  constructor() { super( Charge ); }

  findAllByRequestPeriodAndNullCompletionTime( requestPeriod ) {
    return this._handleOperation(
      () => this._model.findAll(
        {
          where: {
            requestedAt: { [ Op.gte ]: requestPeriod }, 
            completedAt: { [ Op.is ]: null }
          }
        }
      )
    );
  }
}
