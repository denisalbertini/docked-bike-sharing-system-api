import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default.js";
import BikeAdmission from "../../model/models/bike-admission.js";
import Bike from "../../model/models/bike.js";
import Dock from "../../model/models/dock.js";

function defineModel( sequelize ) {
  BikeAdmission.init(
    {
      ...defaultAttributes, 
      requestedAt: {
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW
      }
    }, 
    {
      sequelize, 
      ...defaultOptions( BikeAdmission.name )
    }
  );
}

function defineAssociations() {
  BikeAdmission.belongsTo(
    Bike, 
    { foreignKey: { allowNull: false } }
  );
  BikeAdmission.belongsTo(
    Dock, 
    { foreignKey: { allowNull: false } }
  );
}

export { defineModel, defineAssociations };
