import BaseRepository from "../baseRepository";
import Bike from '../../../model/sequelize/models/bike.js';

export default class BikeRepository extends BaseRepository {
  constructor() { super( Bike ); }
}
