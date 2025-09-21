import BaseModel from './baseModel.js';
import { DataTypes } from 'sequelize';
import Dock from './dock.js';
import Employee from './employee.js';

export default class DockAdmission extends BaseModel {
  static modelAttributes = {
    requestedAt: {
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW
    }
  }

  static defineAssociations() {
    this.belongsTo(
      Dock, 
      { foreignKey: { allowNull: false } }
    );
    this.belongsTo(
      Employee, 
      { foreignKey: { allowNull: false } }
    );
  }
}
