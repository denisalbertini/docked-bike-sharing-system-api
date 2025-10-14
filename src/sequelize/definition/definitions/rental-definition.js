import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default-definition.js";
import Rental from "../../../model/models/rental.js";
import Bike from "../../../model/models/bike.js";
import Biker from "../../../model/models/biker.js";
import Charge from "../../../model/models/charge.js";
import Dock from "../../../model/models/dock.js";

function defineModel( sequelize ) {
  Rental.init(
    {
      ...defaultAttributes, 
      startedAt: {
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW
      }, 
      finishedAt: DataTypes.DATE
    }, 
    {
      sequelize, 
      ...defaultOptions( Rental.name )
    }
  );
}

function defineAssociations() {
  Rental.belongsTo(
    Bike, 
    { foreignKey: { name: 'bikeId', allowNull: false } }
  );
  Rental.belongsTo(
    Biker, 
    { foreignKey: { name: 'bikerId', allowNull: false } }
  );
  Rental.belongsTo(
    Charge, 
    {
      as: 'initialCharge', 
      foreignKey: { name: 'initialChargeId', allowNull: false }
    }
  );
  Rental.belongsTo(
    Charge, 
    {
      as: 'extraCharge', 
      foreignKey: { name: 'extraChargeId' }
    }
  );
  Rental.belongsTo(
    Dock, 
    {
      as: 'rentedFromDock', 
      foreignKey: { name: 'rentedFromDockId', allowNull: false }
    }
  );
  Rental.belongsTo(
    Dock, 
    {
      as: 'returnedToDock', 
      foreignKey: { name: 'returnedToDockId' }
    }
  );
}

export { defineModel, defineAssociations };
