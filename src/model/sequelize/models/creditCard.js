import BaseModel from '../baseModel.js';
import errorMessages from '../enum/errorMessages.js';
import { DataTypes } from 'sequelize';
import Biker from './biker.js';

export default class CreditCard extends BaseModel {
  constructor() {
    throw new Error( errorMessages.modelConstructorMessage );
  }

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
    }, 
    cvv: {
      type: DataTypes.CHAR( 3 ), 
      allowNull: false, 
      validate: {
        is: /\b\d{3}\b/
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
