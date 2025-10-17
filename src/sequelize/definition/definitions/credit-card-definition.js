import { DataTypes } from "sequelize";
import Biker from "../../../model/models/biker.js";
import CreditCard from "../../../model/models/credit-card.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

function defineModel( sequelize ) {
  CreditCard.init(
    {
      ...defaultAttributes, 
      creditCardNumber: {
        type: DataTypes.STRING( 19 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          is: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/
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
        type: DataTypes.STRING( 7 ),
        validate: {
          is: /^(0[1-9]|1[0-2])\/\d{4}$/
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

export { defineAssociations, defineModel };

