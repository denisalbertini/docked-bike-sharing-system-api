import { DataTypes } from "sequelize";
import BikeRemoval from "../../../model/models/bike-removal.js";
import DockAdmission from "../../../model/models/dock-admission.js";
import DockRemoval from "../../../model/models/dock-removal.js";
import Employee from "../../../model/models/employee.js";
import BirthDateValidator from "../../../model/shared/birth-date-validator.js";
import CpfValidator from "../../../model/shared/cpf-validator.js";
import roles from "../../../model/shared/enum/employee-role.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
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
            if ( !new CpfValidator.validate( cpf ) )
              throw new Error( 'Validation isValidCpf on cpf failed' );
          }
        }
      }, 
      name: {
        type: DataTypes.STRING( 100 ), 
        allowNull: false, 
        validate: {
          is: /^[\p{L}\s'.-]+$/u
        }
      }, 
      birthDate: {
        type: DataTypes.DATEONLY, 
        allowNull: false, 
        validate: {
          isValidBirthDate( birthDate ) {
            if ( !new BirthDateValidator.validate( birthDate, 18, 100 ) )
              throw new Error( 'Validation isValidBirthDate on birthDate failed' );
          }
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

export function defineAssociations() {
  Employee.hasMany(
    BikeRemoval, 
    { foreignKey: { name: 'employeeId', allowNull: false } }
  );
  Employee.hasMany(
    DockAdmission, 
    { foreignKey: { name: 'employeeId', allowNull: false } }
  );
  Employee.hasMany(
    DockRemoval, 
    { foreignKey: { name: 'employeeId', allowNull: false } }
  );
}
