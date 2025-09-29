import BaseRepository from "../base-repository";
import BikeRemoval from '../../../model/sequelize/models/bike-removal.js';

export default class BikeRemovalRepository extends BaseRepository {
  constructor() { super( BikeRemoval ); }
}
