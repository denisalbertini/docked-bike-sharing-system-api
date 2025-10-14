import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default-definition.js";
import CreditCard from "../../../model/models/credit-card.js";
import Biker from "../../../model/models/biker.js";

function defineModel( sequelize ) {
  CreditCard.init(
    {
      ...defaultAttributes, 
      number: {
        type: DataTypes.CHAR( 19 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          is: /\b\d{19}\b/
        }
      }, 
      holderName: {
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: {
          is: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/
        }
      }, 
      expirationDate: {
        type: DataTypes.DATEONLY, 
        allowNull: false, 
        validate: {
          isDate: true
        }
      }
    }, 
    {
      sequelize, 
      ...defaultOptions( CreditCard.name )
    }
  );
}

function defineAssociations() {
  CreditCard.hasMany(
    Biker, 
    { foreignKey: { name: 'creditCardId', allowNull: false } }
  );
}

export { defineModel, defineAssociations };
