import BaseRepository from "../base-repository";
import Passport from '../../../model/sequelize/models/passport.js';

export default class PassportRepository extends BaseRepository {
  constructor() { super( Passport ); }
}
