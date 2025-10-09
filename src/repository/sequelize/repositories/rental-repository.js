import BaseRepository from '../base-repository';
import Rental from '../../../model/models/rental.js';
import { Op } from 'sequelize';

export default class RentalRepository extends BaseRepository {
  constructor() { super( Rental ); }

  findByNullFinishTimeAndBikeId( bikeId ) {
    return this._handleOperation(
      () => this._model.findOne(
        { where: { finishedAt: { [ Op.is ]: null }, bikeId } }
      )
    );
  }

  findByNullFinishTimeAndBikerId( bikerId ) {
    return this._handleOperation(
      () => this._model.findOne(
        { where: { finishedAt: { [ Op.is ]: null }, bikerId } }
      )
    );
  }
}
