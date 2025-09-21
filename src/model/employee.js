import BaseModel from './baseModel.js'
import { DataTypes } from 'sequelize';
import roles from './employeeRole.js';
import BikeRemoval from './bikeRemoval.js';
import DockAdmission from './dockAdmission.js';
import DockRemoval from './dockRemoval.js';

export default class Employee extends BaseModel {
  static modelAttributes = {
    registration: {
      type: DataTypes.CHAR( 6 ), 
      allowNull: false, 
      unique: true, 
      validate: {
        is: /\bEM-\d{3}\b/
      }
    }, 
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
    role: {
      type: DataTypes.ENUM, 
      values: roles, 
      allowNull: false, 
      validate: {
        isIn: [ roles ]
      }
    }
  }

  static defineAssociations() {
    this.hasMany(
      BikeRemoval, 
      { foreignKey: { allowNull: false } }
    );
    this.hasMany(
      DockAdmission, 
      { foreignKey: { allowNull: false } }
    );
    this.hasMany(
      DockRemoval, 
      { foreignKey: { allowNull: false } }
    );
  }
}
