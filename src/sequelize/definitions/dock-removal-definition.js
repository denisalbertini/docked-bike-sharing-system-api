import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default.js";
import DockRemoval from "../../model/models/dock-removal.js";
import Dock from "../../model/models/dock.js";
import Employee from "../../model/models/employee.js";

function defineModel( sequelize ) {
  DockRemoval.init(
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
      ...defaultOptions( DockRemoval.name )
    }
  );
}

function defineAssociations() {
  DockRemoval.belongsTo(
    Dock, 
    { foreignKey: { allowNull: false } }
  );
  DockRemoval.belongsTo(
    Employee, 
    { foreignKey: { allowNull: false } }
  );
}

export { defineModel, defineAssociations };
