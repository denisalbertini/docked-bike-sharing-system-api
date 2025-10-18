import Bike from '../../model/models/bike.js';
import BaseRepository from "../base-repository.js";

export default class BikeRepository extends BaseRepository {
  constructor() { super( Bike ); }

  findBySerialNumber( bikeSerial ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { bikeSerial } } )
    );
  }
}
