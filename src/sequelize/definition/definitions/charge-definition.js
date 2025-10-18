import { DataTypes } from "sequelize";
import Biker from "../../../model/models/biker.js";
import Charge from "../../../model/models/charge.js";
import Rental from "../../../model/models/rental.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
  Charge.init(
    {
      ...defaultAttributes, 
      requestedAt: {
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW
      }, 
      completedAt: DataTypes.DATE, 
      amount: {
        type: DataTypes.DECIMAL( 10, 2 ), 
        allowNull: false, 
        validate: {
          isDecimal: true
        }
      }
    }, 
    {
      sequelize, 
      ...defaultOptions( Charge.name )
    }
  );
}

export function defineAssociations() {
  Charge.hasMany(
    Rental, 
    {
      as: 'initialCharge', 
      foreignKey: { name: 'initialChargeId', allowNull: false }
    }
  );
  Charge.hasMany(
    Rental, 
    {
      as: 'extraCharge', 
      foreignKey: 'extraChargeId'
    }
  );
  Charge.belongsTo(
    Biker, 
    { foreignKey: { name: 'bikerId', allowNull: false } }
  );
}
