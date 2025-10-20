import { DataTypes } from "sequelize";
import DockRemoval from "../../../model/models/dock-removal.js";
import Dock from "../../../model/models/dock.js";
import Employee from "../../../model/models/employee.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
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

export function defineAssociations() {
  DockRemoval.belongsTo(
    Dock, 
    { foreignKey: { name: 'dockId', allowNull: false } }
  );
  DockRemoval.belongsTo(
    Employee, 
    { foreignKey: { name: 'employeeId', allowNull: false } }
  );
}
