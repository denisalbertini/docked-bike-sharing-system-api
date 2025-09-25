import BaseModel from '../baseModel.js';
import errorMessages from '../enum/errorMessages.js';
import { DataTypes } from 'sequelize';
import Bike from './bike.js';
import Employee from './employee.js';

export default class BikeRemoval extends BaseModel {
  constructor() {
    throw new Error( errorMessages.modelConstructorMessage );
  }

  static modelAttributes = {
    requestedAt: {
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW
    }
  }

  static defineAssociations() {
    this.belongsTo(
      Bike, 
      { foreignKey: { allowNull: false } }
    );
    this.belongsTo(
      Employee, 
      { foreignKey: { allowNull: false } }
    );
  }
}
