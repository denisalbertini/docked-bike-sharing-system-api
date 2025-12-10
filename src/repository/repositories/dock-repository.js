import Dock from '../../model/models/dock.js';
import BaseRepository from "../base-repository.js";

export default class DockRepository extends BaseRepository {
  constructor() { super( Dock ); }

  findBySerialNumber( dockSerial ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { dockSerial } } )
    );
  }

  findByBikeId( bikeId ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { bikeId } } )
    );
  }

  deleteById( id, transaction = null ) {
    return this._handleOperation(
      () => this._model.destroy(
        {
          where: { id }, 
          individualHooks: true, 
          ...( transaction && { transaction } )
        }
      )
    );
  }

  findAllByStationId( stationId ) {
    return this._handleOperation(
      () => this._model.findAll( { where: { stationId } } )
    );
  }
}
