import BaseModel from '../baseModel.js';
import errorMessages from '../enum/errorMessages.js';
import { DataTypes } from 'sequelize';
import Biker from './biker.js';

export default class Passport extends BaseModel {
  constructor() {
    throw new Error( errorMessages.modelConstructorMessage );
  }

  static modelAttributes = {
    number: {
      type: DataTypes.STRING( 9 ), 
      allowNull: false, 
      unique: true, 
      validate: {
        is: /^[A-Za-z0-9]{6,9}$/
      }
    }, 
    expirationDate: {
      type: DataTypes.DATEONLY, 
      allowNull: false, 
      validate: {
        isDate: true
      }
    }, 
    countryCode: {
      type: DataTypes.CHAR( 3 ), 
      allowNull: false, 
      validate: {
        is: /\b[A-Z]{3}\b/
      }
    }
  }

  static defineAssociations() {
    this.belongsTo(
      Biker, 
      { foreignKey: { allowNull: false } }
    );
  }
}
