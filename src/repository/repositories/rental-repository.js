import { Op } from 'sequelize';
import Rental from '../../model/models/rental.js';
import BaseRepository from '../base-repository.js';

export default class RentalRepository extends BaseRepository {
  constructor() { super( Rental ); }

  findByNullFinishTimeAndBikerId( bikerId ) {
    return this._handleOperation(
      () => this._model.findOne(
        { where: { finishedAt: { [ Op.is ]: null }, bikerId } }
      )
    );
  }

  findByNullFinishTimeAndBikeId( bikeId ) {
    return this._handleOperation(
      () => this._model.findOne(
        { where: { finishedAt: { [ Op.is ]: null }, bikeId } }
      )
    );
  }
}
