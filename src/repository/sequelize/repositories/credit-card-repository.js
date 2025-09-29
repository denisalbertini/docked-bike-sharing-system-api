import BaseRepository from "../base-repository";
import CreditCard from '../../../model/sequelize/models/credit-card.js';

export default class CreditCardRepository extends BaseRepository {
  constructor() { super( CreditCard ); }
}
