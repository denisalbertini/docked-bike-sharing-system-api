import BaseRepository from "../base-repository";
import Station from '../../../model/models/station.js';

export default class StationRepository extends BaseRepository {
  constructor() { super( Station ); }

  findBySerialNumber( serialNumber ) {
    return this._handleOperation(
      () => this._model.findOne( { where: serialNumber } )
    );
  }
}
