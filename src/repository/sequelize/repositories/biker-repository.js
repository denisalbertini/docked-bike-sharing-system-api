import BaseRepository from "../base-repository";
import Biker from '../../../model/sequelize/models/biker.js';

export default class BikerRepository extends BaseRepository {
  constructor() { super( Biker ); }

  findByEmail( email ) {
    return this.handleOperation(
      () => this.model.findOne( { where: email } )
    );
  }
}
