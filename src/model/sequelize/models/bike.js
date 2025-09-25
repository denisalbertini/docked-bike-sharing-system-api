import BaseModel from '../baseModel.js';
import errorMessages from '../enum/errorMessages.js';
import { DataTypes } from 'sequelize';
import status from '../enum/bikeStatus.js';
import Dock from './dock.js';
import BikeAdmission from './bikeAdmission.js';
import BikeRemoval from './bikeRemoval.js';
import Rental from './rental.js';

export default class Bike extends BaseModel {
  constructor() {
    throw new Error( errorMessages.modelConstructorMessage );
  }

  static modelAttributes = {
    serialNumber: {
      type: DataTypes.CHAR( 6 ), 
      allowNull: false, 
      unique: true, 
      validate: {
        is: /\bBI-\d{3}\b/
      }
    }, 
    brand: {
      type: DataTypes.STRING( 100 ), 
      allowNull: false
    }, 
    model: {
      type: DataTypes.STRING( 100 ), 
      allowNull: false
    }, 
    manufactureYear: {
      type: DataTypes.INTEGER, 
      allowNull: false, 
      validate: {
        is: /\b(19|20)\d{2}\b/
      }
    }, 
    status: {
      type: DataTypes.ENUM, 
      values: Object.values( status ), 
      allowNull: false, 
      defaultValue: status.new, 
      validate: {
        isIn: [ Object.values( status ) ]
      }
    }
  }

  static modelOptions = {
    paranoid: true
  }

  static defineAssociations() {
    this.hasOne( Dock );
    this.hasMany(
      BikeAdmission, 
      { foreignKey: { allowNull: false } }
    );
    this.hasMany( 
      BikeRemoval, 
      { foreignKey: { allowNull: false } }
    );
    this.hasMany(
      Rental, 
      { foreignKey: { allowNull: false } }
    );
  }
}
