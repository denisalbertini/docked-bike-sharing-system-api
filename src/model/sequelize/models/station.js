import BaseModel from '../baseModel.js';
import errorMessages from '../enum/errorMessages.js';
import { DataTypes } from 'sequelize';
import Dock from './dock.js';

export default class Station extends BaseModel {
  constructor() {
    throw new Error( errorMessages.modelConstructorMessage );
  }

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

  static defineAssociations() {
    this.hasMany( Dock );
  }
}
