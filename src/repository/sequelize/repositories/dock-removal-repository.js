import BaseRepository from "../base-repository";
import DockRemoval from '../../../model/sequelize/models/dock-removal.js';

export default class DockRemovalRepository extends BaseRepository {
  constructor() { super( DockRemoval ); }
}
