import BaseRepository from "../base-repository";
import Dock from '../../../model/models/dock.js';

export default class DockRepository extends BaseRepository {
  constructor() { super( Dock ); }

  findBySerialNumber( serialNumber ) {
    return this.handleOperation(
      () => this.model.findOne( { where: { serialNumber } } )
    );
  }

  findByBikeId( bikeId ) {
    return this.handleOperation(
      () => this.model.findOne( { where: { bikeId } } )
    );
  }

  deleteById( id ) {
    return this.handleOperation(
      () => this.model.destroy(
        { where: { id }, individualHooks: true }
      )
    );
  }

  findAllByStationId( stationId ) {
    return this.handleOperation(
      () => this.model.findAll( { where: stationId } )
    );
  }
}
