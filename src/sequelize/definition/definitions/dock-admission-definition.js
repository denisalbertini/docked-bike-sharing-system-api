import { DataTypes } from "sequelize";
import DockAdmission from "../../../model/models/dock-admission.js";
import Dock from "../../../model/models/dock.js";
import Employee from "../../../model/models/employee.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
  DockAdmission.init(
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
      ...defaultOptions( DockAdmission.name )
    }
  );
}

export function defineAssociations() {
  DockAdmission.belongsTo(
    Dock, 
    { foreignKey: { name: 'dockId', allowNull: false } }
  );
  DockAdmission.belongsTo(
    Employee, 
    { foreignKey: { name: 'employeeId', allowNull: false } }
  );
}
