import BaseModel from './baseModel.js';
import { DataTypes } from 'sequelize';
import { bikeStatus } from './status.js';

export default class Bike extends BaseModel {
  static modelAttributes = {
    id: {
      type: DataTypes.UUID, 
      primaryKey: true
    }, 
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
      values: bikeStatus, 
      allowNull: false, 
      defaultValue: 'NEW', 
      validate: {
        isIn: [ bikeStatus ]
      }
    }
  }
}
