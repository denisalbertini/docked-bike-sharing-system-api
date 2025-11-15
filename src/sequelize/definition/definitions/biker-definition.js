import { DataTypes } from "sequelize";
import Biker from "../../../model/models/biker.js";
import Charge from "../../../model/models/charge.js";
import CreditCard from "../../../model/models/credit-card.js";
import Passport from "../../../model/models/passport.js";
import Rental from "../../../model/models/rental.js";
import BirthDateValidator from "../../../model/shared/birth-date-validator.js";
import CpfValidator from "../../../model/shared/cpf-validator.js";
import status from "../../../model/shared/enum/biker-status.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
  Biker.init(
    {
      ...defaultAttributes, 
      cpf: {
        type: DataTypes.CHAR( 11 ), 
        unique: true, 
        validate: {
          isValidCpf( cpf ) {
            if ( !new CpfValidator().validate( cpf ) )
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
            if ( !new BirthDateValidator().validate( birthDate, 12, 100 ) )
              throw new Error( 'Validation isValidBirthDate on birthDate failed' );
          }
        }
      }, 
      email: {
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true, 
        validate: {
          isEmail: true
        }
      }, 
      password: {
        type: DataTypes.CHAR( 60 ), 
        allowNull: false, 
        validate: {
          is: /\$2[aby]\$10\$[./A-Za-z0-9]{53}/
        }
      }, 
      status: {
        type: DataTypes.ENUM, 
        values: Object.values( status ), 
        allowNull: false, 
        defaultValue: status.PENDING, 
        validate: {
          isIn: [ Object.values( status ) ]
        }
      }
    }, 
    {
      sequelize, 
      ...defaultOptions( Biker.name ), 
      hooks: {
        beforeCreate: ( biker, _options ) => {
          biker.status = status.PENDING;
        }
      }
    }
  );
}

export function defineAssociations() {
  Biker.hasOne( Passport, { foreignKey: 'bikerId' } );
  Biker.hasMany(
    Charge, 
    { foreignKey: { name: 'bikerId', allowNull: false } }
  );
  Biker.hasMany(
    Rental, 
    { foreignKey: { name: 'bikerId', allowNull: false } }
  );
  Biker.belongsTo(
    CreditCard, 
    { foreignKey: { name: 'creditCardId', allowNull: false } }
  );
}
