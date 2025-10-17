import Biker from '../../model/models/biker.js';
import BaseRepository from "../base-repository.js";

export default class BikerRepository extends BaseRepository {
  constructor() { super( Biker ); }

  findByEmail( email ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { email } } )
    );
  }
}
