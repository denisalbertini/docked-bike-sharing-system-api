import BaseRepository from "../baseRepository";
import BikeRemoval from '../../../model/sequelize/models/bikeRemoval.js';

export default class BikeRemovalRepository extends BaseRepository {
  constructor() { super( BikeRemoval ); }
}
