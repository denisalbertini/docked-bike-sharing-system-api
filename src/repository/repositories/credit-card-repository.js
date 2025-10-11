import BaseRepository from "../base-repository.js";
import CreditCard from '../../model/models/credit-card.js';

export default class CreditCardRepository extends BaseRepository {
  constructor() { super( CreditCard ); }

  findOrCreate( data ) {
    return this._handleOperation(
      () => this._model.findOrCreate( { where: data } )
    );
  }
}
