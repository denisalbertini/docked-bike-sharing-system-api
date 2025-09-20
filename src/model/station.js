import BaseModel from './baseModel.js';
import { DataTypes } from 'sequelize';

export default class Station extends BaseModel {
  static modelAttributes = {
    serialNumber: {
      type: DataTypes.CHAR( 6 ), 
      allowNull: false, 
      unique: true, 
      validate: {
        is: /\bST-\d{3}\b/
      }
    }, 
    name: {
      type: DataTypes.STRING, 
      allowNull: false
    }, 
    location: {
      type: DataTypes.STRING, 
      allowNull: false
    }
  }
}
