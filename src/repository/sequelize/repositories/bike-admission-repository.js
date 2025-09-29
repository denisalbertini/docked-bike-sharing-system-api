import BaseRepository from "../base-repository";
import BikeAdmission from '../../../model/sequelize/models/bike-admission.js';

export default class BikeAdmissionRepository extends BaseRepository {
  constructor() { super( BikeAdmission ); }
}
