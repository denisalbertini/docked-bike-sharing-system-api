import BaseRepository from "../baseRepository";
import BikeAdmission from '../../../model/sequelize/models/bikeAdmission.js';

export default class BikeAdmissionRepository extends BaseRepository {
  constructor() { super( BikeAdmission ); }
}
