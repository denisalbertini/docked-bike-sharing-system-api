import BaseRepository from "../baseRepository";
import DockAdmission from '../../../model/sequelize/models/dockAdmission.js';

export default class DockAdmissionRepository extends BaseRepository {
  constructor() { super( DockAdmission ); }
}
