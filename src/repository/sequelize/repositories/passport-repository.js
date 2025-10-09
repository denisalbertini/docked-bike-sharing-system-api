import BaseRepository from "../base-repository";
import Passport from '../../../model/models/passport.js';

export default class PassportRepository extends BaseRepository {
  constructor() { super( Passport ); }

  findByBikerId( id ) {
    return this.handleOperation(
      () => this.model.findOne( { where: { bikerId: id } } )
    );
  }
}
