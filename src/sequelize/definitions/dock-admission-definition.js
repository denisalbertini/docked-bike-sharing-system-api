import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default.js";
import DockAdmission from "../../model/models/dock-admission.js";
import Dock from "../../model/models/dock.js";
import Employee from "../../model/models/employee.js";

function defineModel( sequelize ) {
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

function defineAssociations() {
  DockAdmission.belongsTo(
    Dock, 
    { foreignKey: { allowNull: false } }
  );
  DockAdmission.belongsTo(
    Employee, 
    { foreignKey: { allowNull: false } }
  );
}

export { defineModel, defineAssociations };
