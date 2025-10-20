import { DataTypes } from "sequelize";
import Biker from "../../../model/models/biker.js";
import Passport from "../../../model/models/passport.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
  Passport.init(
    {
      ...defaultAttributes, 
      passportNumber: {
        type: DataTypes.STRING( 9 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          is: /^[A-Za-z0-9]{6,9}$/
        }
      }, 
      expirationDate: {
        type: DataTypes.DATEONLY, 
        allowNull: false, 
        validate: {
          isDate: true
        }
      }, 
      countryCode: {
        type: DataTypes.CHAR( 3 ), 
        allowNull: false, 
        validate: {
          is: /\b[A-Z]{3}\b/
        }
      }
    }, 
    {
      sequelize, 
      ...defaultOptions( Passport.name )
    }
  );
}

export function defineAssociations() {
  Passport.belongsTo(
    Biker, 
    { foreignKey: { name: 'bikerId', allowNull: false } }
  );
}
