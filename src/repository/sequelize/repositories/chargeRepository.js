import BaseRepository from "../baseRepository";
import Charge from '../../../model/sequelize/models/charge.js';

export default class ChargeRepository extends BaseRepository {
  constructor() { super( Charge ); }

  findAllByNullCompletionTime() {
    return this.handleOperation(
      () => this.model.findAll( { where: { completedAt: null } } )
    );
  }
}
