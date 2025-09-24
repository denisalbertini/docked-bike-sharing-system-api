import BaseRepository from "../baseRepository";
import Charge from '../../../model/sequelize/models/charge.js';

export default class ChargeRepository extends BaseRepository {
  constructor() { super( Charge ); }
}
