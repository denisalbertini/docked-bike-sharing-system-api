import BaseModel from '../baseModel.js';
import errorMessages from '../enum/errorMessages.js';
import { DataTypes } from 'sequelize';
import status from '../enum/bikeStatus.js';
import Passport from './passport.js';
import Rental from './rental.js';
import Charge from './charge.js';
import CreditCard from './creditCard.js';

export default class Biker extends BaseModel {
  constructor() {
    throw new Error( errorMessages.modelConstructorMessage );
  }

  static modelAttributes = {
    cpf: {
      type: DataTypes.CHAR( 11 ), 
      allowNull: false, 
      unique: true, 
      validate: {
        is: /\b\d{11}\b/
      }
    }, 
    name: {
      type: DataTypes.STRING, 
      allowNull: false, 
      validate: {
        is: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/
      }
    }, 
    birthDate: {
      type: DataTypes.DATEONLY, 
      allowNull: false, 
      validate: {
        isDate: true
      }
    }, 
    email: {
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true, 
      validate: {
        isEmail: true
      }
    }, 
    password: {
      type: DataTypes.CHAR( 60 ), 
      allowNull: false, 
      validate: {
        is: /\$2[aby]\$10\$[./A-Za-z0-9]{53}/
      }
    }, 
    foreigner: {
      type: DataTypes.BOOLEAN, 
      allowNull: false, 
      validate: {
        isIn: [ [ true, false ] ]
      }
    }, 
    status: {
      type: DataTypes.ENUM, 
      values: Object.values( status ), 
      allowNull: false, 
      defaultValue: status.pending, 
      validate: {
        isIn: [ Object.values( status ) ]
      }
    }
  }

  static defineAssociations() {
    this.hasOne( Passport );
    this.hasMany(
      Charge, 
      { foreignKey: { allowNull: false } }
    );
    this.hasMany(
      Rental, 
      { foreignKey: { allowNull: false } }
    );
    this.belongsTo(
      CreditCard, 
      { foreignKey: { allowNull: false } }
    );
  }
}
