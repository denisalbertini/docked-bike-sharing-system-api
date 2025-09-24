import BaseRepository from "../baseRepository";
import CreditCard from '../../../model/sequelize/models/creditCard.js';

export default class CreditCardRepository extends BaseRepository {
  constructor() { super( CreditCard ); }
}
