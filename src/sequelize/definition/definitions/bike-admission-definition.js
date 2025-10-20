import { DataTypes } from "sequelize";
import BikeAdmission from "../../../model/models/bike-admission.js";
import Bike from "../../../model/models/bike.js";
import Dock from "../../../model/models/dock.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
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

export function defineAssociations() {
  BikeAdmission.belongsTo(
    Bike, 
    { foreignKey: { name: 'bikeId', allowNull: false } }
  );
  BikeAdmission.belongsTo(
    Dock, 
    { foreignKey: { name: 'dockId', allowNull: false } }
  );
}
