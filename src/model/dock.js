import BaseModel from './baseModel.js';
import { DataTypes } from 'sequelize';
import { dockStatus } from './status.js';

export default class Dock extends BaseModel {
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
        is: /\bDO-\d{3}\b/
      }
    }, 
    model: {
      type: DataTypes.STRING( 100 ), 
      allowNull: false
    }, 
    manufactureDate: {
      type: DataTypes.DATEONLY, 
      allowNull: false, 
      validate: {
        isDate: true
      }
    }, 
    status: {
      type: DataTypes.ENUM(), 
      values: dockStatus, 
      allowNull: false, 
      defaultValue: 'OPERATIONAL', 
      validate: {
        isIn: [ dockStatus ]
      }
    }
  }
}
