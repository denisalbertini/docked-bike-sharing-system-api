import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default-definition.js";
import Charge from "../../../model/models/charge.js";
import Rental from "../../../model/models/rental.js";
import Biker from "../../../model/models/biker.js";

function defineModel( sequelize ) {
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

function defineAssociations() {
  Charge.hasMany(
    Rental, 
    {
      as: 'initialCharge', 
      foreignKey: { name: 'initial_charge_id', allowNull: false }
    }
  );
  Charge.hasMany(
    Rental, 
    {
      as: 'extraCharge', 
      foreignKey: 'extra_charge_id'
    }
  );
  Charge.belongsTo(
    Biker, 
    { foreignKey: { allowNull: false } }
  );
}

export { defineModel, defineAssociations };
