import BaseRepository from "../base-repository.js";
import Passport from '../../model/models/passport.js';

export default class PassportRepository extends BaseRepository {
  constructor() { super( Passport ); }

  findByBikerId( id ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { bikerId: id } } )
    );
  }
}
