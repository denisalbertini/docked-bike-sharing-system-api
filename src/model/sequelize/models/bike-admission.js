import BaseModel from '../baseModel.js';
import { DataTypes } from 'sequelize';
import Bike from './bike.js';
import Dock from './dock.js';

export default class BikeAdmission extends BaseModel {
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
      Dock, 
      { foreignKey: { allowNull: false } }
    );
  }
}
