import { DataTypes } from "sequelize";
import Biker from "../../../model/models/biker.js";
import Charge from "../../../model/models/charge.js";
import CreditCard from "../../../model/models/credit-card.js";
import Passport from "../../../model/models/passport.js";
import Rental from "../../../model/models/rental.js";
import Cpf from "../../../model/shared/cpf.js";
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
      foreigner: {
        type: DataTypes.BOOLEAN, 
        allowNull: false, 
        validate: {
          isIn: [ [ true, false ] ]
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
          if ( biker.status !== status.PENDING )
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
