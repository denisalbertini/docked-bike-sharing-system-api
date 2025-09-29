import BaseRepository from "../baseRepository";
import Biker from '../../../model/sequelize/models/biker.js';

export default class BikerRepository extends BaseRepository {
  constructor() { super( Biker ); }
}
