import BaseRepository from "../baseRepository";
import DockRemoval from '../../../model/sequelize/models/dockRemoval.js';

export default class DockRemovalRepository extends BaseRepository {
  constructor() { super( DockRemoval ); }
}
