import BaseRepository from "../base-repository.js";
import BikeAdmission from '../../model/models/bike-admission.js';

export default class BikeAdmissionRepository extends BaseRepository {
  constructor() { super( BikeAdmission ); }
}
