import BaseRepository from "../base-repository";
import DockAdmission from '../../../model/sequelize/models/dock-admission.js';

export default class DockAdmissionRepository extends BaseRepository {
  constructor() { super( DockAdmission ); }
}
