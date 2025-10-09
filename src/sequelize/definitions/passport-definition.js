import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default.js";
import Passport from "../../model/models/passport.js";
import Biker from "../../model/models/biker.js";

function defineModel( sequelize ) {
  Passport.init(
    {
      ...defaultAttributes, 
      number: {
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

function defineAssociations() {
  Passport.belongsTo(
    Biker, 
    { foreignKey: { allowNull: false } }
  );
}

export { defineModel, defineAssociations };
