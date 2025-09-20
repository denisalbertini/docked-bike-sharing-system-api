import BaseModel from './baseModel.js';
import { DataTypes } from 'sequelize';

export default class CreditCard extends BaseModel {
  static moodelAttributes = {
    id: {
      type: DataTypes.UUID, 
      primaryKey: true
    }, 
    number: {
      type: DataTypes.CHAR( 19 ), 
      allowNull: false, 
      unique: true, 
      validate: {
        is: /\b\d{19}\b/
      }
    }, 
    holderName: {
      type: DataTypes.STRING, 
      allowNull: false, 
      validate: {
        is: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/
      }
    }, 
    expirationDate: {
      type: DataTypes.DATEONLY, 
      allowNull: false, 
      validate: {
        isDate: true
      }
    }, 
    cvv: {
      type: DataTypes.CHAR( 3 ), 
      allowNull: false, 
      validate: {
        is: /\b\d{3}\b/
      }
    }
  }
}
