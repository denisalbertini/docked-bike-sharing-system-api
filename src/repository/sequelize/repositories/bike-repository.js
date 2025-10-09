import BaseRepository from "../base-repository";
import Bike from '../../../model/models/bike.js';

export default class BikeRepository extends BaseRepository {
  constructor() { super( Bike ); }

  findBySerialNumber( serialNumber ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { serialNumber } } )
    );
  }
}
