import Biker from '../../model/models/biker.js';
import bikerStatus from '../../model/shared/enum/biker-status.js';
import BaseRepository from "../base-repository.js";

export default class BikerRepository extends BaseRepository {
  constructor() { super( Biker ); }

  findByEmailAndActiveStatus( email ) {
    return this._handleOperation(
      () => this._model.findOne( { where: { email, status: bikerStatus.ACTIVE } } )
    );
  }
}
