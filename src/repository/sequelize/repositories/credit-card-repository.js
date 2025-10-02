import BaseRepository from "../base-repository";
import CreditCard from '../../../model/sequelize/models/credit-card.js';

export default class CreditCardRepository extends BaseRepository {
  constructor() { super( CreditCard ); }

  findOrCreate( data ) {
    return this.handleOperation(
      () => this.model.findOrCreate( { where: data } )
    );
  }
}
