import BaseRepository from "../baseRepository";
import Rental from '../../../model/sequelize/models/rental.js';

export default class RentalRepository extends BaseRepository {
  constructor() { super( Rental ); }

  findByNullFinishTimeAndBikeId( bikeId ) {
    return this.handleOperation(
      () => this.model.findOne(
        { where: { finishedAt: null, bikeId } }
      )
    );
  }
}
