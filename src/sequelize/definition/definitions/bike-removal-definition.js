import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default-definition.js";
import BikeRemoval from "../../../model/models/bike-removal.js";
import Bike from "../../../model/models/bike.js";
import Employee from "../../../model/models/employee.js";

function defineModel( sequelize ) {
  BikeRemoval.init(
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
      ...defaultOptions( BikeRemoval.name )
    }
  );
}

function defineAssociations() {
  BikeRemoval.belongsTo(
    Bike, 
    { foreignKey: { name: 'bikeId', allowNull: false } }
  );
  BikeRemoval.belongsTo(
    Employee, 
    { foreignKey: { name: 'employeeId', allowNull: false } }
  );
}

export { defineModel, defineAssociations };
