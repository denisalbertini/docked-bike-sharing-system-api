import BaseRepository from "../base-repository.js";
import Dock from '../../model/models/dock.js';

export default class DockRepository extends BaseRepository {
  constructor() { super( Dock ); }

  findBySerialNumber( serialNumber ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { serialNumber } } )
    );
  }

  findByBikeId( bikeId ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { bikeId } } )
    );
  }

  deleteById( id ) {
    return this._handleOperation(
      () => this._model.destroy(
        { where: { id }, individualHooks: true }
      )
    );
  }

  findAllByStationId( stationId ) {
    return this._handleOperation(
      () => this._model.findAll( { where: stationId } )
    );
  }
}
