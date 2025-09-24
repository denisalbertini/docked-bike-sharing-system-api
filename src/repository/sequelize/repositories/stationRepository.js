import BaseRepository from "../baseRepository";
import Station from '../../../model/sequelize/models/station.js';

export default class StationRepository extends BaseRepository {
  constructor() { super( Station ); }
}
