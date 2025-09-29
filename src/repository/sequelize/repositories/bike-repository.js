import BaseRepository from "../base-repository";
import Bike from '../../../model/sequelize/models/bike.js';

export default class BikeRepository extends BaseRepository {
  constructor() { super( Bike ); }

  findBySerialNumber( serialNumber ) {
    return this.handleOperation(
      () => this.model.findOne( { where: { serialNumber } } )
    );
  }
}
