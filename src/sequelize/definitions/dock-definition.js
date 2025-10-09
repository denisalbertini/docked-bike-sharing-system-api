import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default.js";
import Dock from "../../model/models/dock.js";
import status from '../../model/shared/enum/dock-status.js';
import BikeAdmission from "../../model/models/bike-admission.js";
import DockAdmission from "../../model/models/dock-admission.js";
import DockRemoval from "../../model/models/dock-removal.js";
import Rental from "../../model/models/rental.js";
import Bike from "../../model/models/bike.js";
import Station from "../../model/models/station.js";

function defineModel( sequelize ) {
  Dock.init(
    {
      ...defaultAttributes, 
      serialNumber: {
        type: DataTypes.CHAR( 6 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          is: /\bDO-\d{3}\b/
        }
      }, 
      model: {
        type: DataTypes.STRING( 100 ), 
        allowNull: false
      }, 
      manufactureDate: {
        type: DataTypes.DATEONLY, 
        allowNull: false, 
        validate: {
          isDate: true
        }
      }, 
      status: {
        type: DataTypes.ENUM(), 
        values: Object.values( status ), 
        allowNull: false, 
        defaultValue: status.OPERATIONAL, 
        validate: {
          isIn: [ Object.values( status ) ]
        }
      }
    }, 
    {
      sequelize, 
      paranoid: true, 
      ...defaultOptions( Dock.name ), 
      hooks: {
        beforeDestroy: ( dock, _options ) => {
          if ( dock.bikeId !== null )
            throw new ForeignKeyConstraintError( 'Dock has a bike attached.' );
        }
      }
    }
  );
}

function defineAssociations() {
  Dock.hasMany(
    BikeAdmission, 
    { foreignKey: { allowNull: false } }
  );
  Dock.hasMany(
    DockAdmission, 
    { foreignKey: { allowNull: false } }
  );
  Dock.hasMany(
    DockRemoval, 
    { foreignKey: { allowNull: false } }
  );
  Dock.hasMany(
    Rental, 
    {
      as: 'rentedFromDock', 
      foreignKey: { name: 'rented_from_dock_id', allowNull: false }
    }
  );
  Dock.hasMany(
    Rental, 
    {
      as: 'returnedToDock', 
      foreignKey: { name: 'returned_to_dock_id' }
    }
  );
  Dock.belongsTo( Bike );
  Dock.belongsTo( Station );
}

export { defineModel, defineAssociations };
