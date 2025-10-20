import { DataTypes } from "sequelize";
import Biker from "../../../model/models/biker.js";
import CreditCard from "../../../model/models/credit-card.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
  CreditCard.init(
    {
      ...defaultAttributes, 
      creditCardNumber: {
        type: DataTypes.STRING( 19 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          len: [ 13, 19 ]
        }
      }, 
      holderName: {
        type: DataTypes.STRING( 100 ), 
        allowNull: false, 
        validate: {
          is: /^[\p{L}\s'.-]+$/u
        }
      }, 
      expirationDate: {
        type: DataTypes.STRING( 7 ),
        validate: {
          is: /^(0[1-9]|1[0-2])\/\d{2}$/
        }
      }
    }, 
    {
      sequelize, 
      ...defaultOptions( CreditCard.name )
    }
  );
}

export function defineAssociations() {
  CreditCard.hasMany(
    Biker, 
    { foreignKey: { name: 'creditCardId', allowNull: false } }
  );
}
