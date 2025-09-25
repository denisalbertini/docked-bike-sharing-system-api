import BaseRepository from "../baseRepository";
import Dock from '../../../model/sequelize/models/dock.js';

export default class DockRepository extends BaseRepository {
  constructor() { super( Dock ); }

  findBySerialNumber( serialNumber ) {
    return this.handleOperation(
      () => this.model.findOne( { where: { serialNumber } } )
    );
  }
}
