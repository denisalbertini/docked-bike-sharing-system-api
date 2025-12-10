import CreditCard from '../../model/models/credit-card.js';
import BaseRepository from "../base-repository.js";

export default class CreditCardRepository extends BaseRepository {
  constructor() { super( CreditCard ); }

  findOrCreate( data, transaction = null ) {
    return this._handleOperation(
      () => this._model.findOrCreate(
        { where: data, ...( transaction && { transaction } ) }
      )
    );
  }
}
