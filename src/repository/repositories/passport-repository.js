import Passport from '../../model/models/passport.js';
import BaseRepository from "../base-repository.js";

export default class PassportRepository extends BaseRepository {
  constructor() { super( Passport ); }

  findByBikerId( id ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { bikerId: id } } )
    );
  }

  updateByBikerId( bikerId, data, transaction = null ) {
    return this._handleOperation(
      () => this._model.update(
        data, 
        {
          where: { bikerId }, 
          returning: true, 
          ...( transaction && { transaction } )
        }
      )
    );
  }
}
