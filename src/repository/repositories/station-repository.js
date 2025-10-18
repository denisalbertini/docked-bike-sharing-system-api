import Station from '../../model/models/station.js';
import BaseRepository from "../base-repository.js";

export default class StationRepository extends BaseRepository {
  constructor() { super( Station ); }

  findBySerialNumber( stationSerial ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { stationSerial } } )
    );
  }
}
