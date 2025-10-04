import BaseModel from '../base-model.js';
import { DataTypes } from 'sequelize';
import Biker from './biker.js';

export default class CreditCard extends BaseModel {
  static modelAttributes = {
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
    }
  }

  static defineAssociations() {
    this.hasMany(
      Biker, 
      { foreignKey: { allowNull: false } }
    );
  }
}
