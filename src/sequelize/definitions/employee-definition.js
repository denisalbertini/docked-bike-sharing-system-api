import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default.js";
import Employee from "../../model/models/employee.js";
import Cpf from "../../model/shared/cpf.js";
import roles from "../../model/shared/enum/employee-role.js";
import BikeRemoval from "../../model/models/bike-removal.js";
import DockAdmission from "../../model/models/dock-admission.js";
import DockRemoval from "../../model/models/dock-removal.js";

function defineModel( sequelize ) {
  Employee.init(
    {
      ...defaultAttributes, 
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
            if ( !Cpf.validate( cpf ) )
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
    }, 
    {
      sequelize, 
      paranoid: true, 
      ...defaultOptions( Employee.name )
    }
  );
}

function defineAssociations() {
  Employee.hasMany(
    BikeRemoval, 
    { foreignKey: { allowNull: false } }
  );
  Employee.hasMany(
    DockAdmission, 
    { foreignKey: { allowNull: false } }
  );
  Employee.hasMany(
    DockRemoval, 
    { foreignKey: { allowNull: false } }
  );
}

export { defineModel, defineAssociations };
