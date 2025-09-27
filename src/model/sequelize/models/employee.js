import BaseModel from '../baseModel.js';
import { DataTypes } from 'sequelize';
import validateCpf from '../CpfValidation.js';
import roles from '../enum/employeeRole.js';
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
        isCpf( cpf ) {
          if ( !validateCpf( cpf ) )
            throw new Error( 'Invalid CPF.' );
        }
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
      values: Object.values( roles ), 
      allowNull: false, 
      validate: {
        isIn: [ Object.values( roles ) ]
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
