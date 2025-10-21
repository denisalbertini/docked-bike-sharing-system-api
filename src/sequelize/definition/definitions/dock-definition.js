import ForeignKeyConstraintError, { DataTypes } from "sequelize";
import BikeAdmission from "../../../model/models/bike-admission.js";
import Bike from "../../../model/models/bike.js";
import DockAdmission from "../../../model/models/dock-admission.js";
import DockRemoval from "../../../model/models/dock-removal.js";
import Dock from "../../../model/models/dock.js";
import Rental from "../../../model/models/rental.js";
import Station from "../../../model/models/station.js";
import status from '../../../model/shared/enum/dock-status.js';
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
  Dock.init(
    {
      ...defaultAttributes, 
      dockSerial: {
        type: DataTypes.CHAR( 6 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          is: /\bDO-\d{3}\b/
        }
      }, 
      model: {
        type: DataTypes.STRING( 100 ), 
        allowNull: false, 
        validate: {
          len: [ 1, 100 ]
        }
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
        beforeCreate: ( dock, _options ) => {
          dock.status = status.OPERATIONAL;
        }, 
        beforeDestroy: ( dock, _options ) => {
          if ( dock.bikeId !== null )
            throw new ForeignKeyConstraintError( 'Dock has a bike attached.' );
        }
      }
    }
  );
}

export function defineAssociations() {
  Dock.hasMany(
    BikeAdmission, 
    { foreignKey: { name: 'dockId', allowNull: false } }
  );
  Dock.hasMany(
    DockAdmission, 
    { foreignKey: { name: 'dockId', allowNull: false } }
  );
  Dock.hasMany(
    DockRemoval, 
    { foreignKey: { name: 'dockId', allowNull: false } }
  );
  Dock.hasMany(
    Rental, 
    {
      as: 'rentedFromDock', 
      foreignKey: { name: 'rentedFromDockId', allowNull: false }
    }
  );
  Dock.hasMany(
    Rental, 
    {
      as: 'returnedToDock', 
      foreignKey: { name: 'returnedToDockId' }
    }
  );
  Dock.belongsTo( Bike, { foreignKey: 'bikeId' } );
  Dock.belongsTo( Station, { foreignKey: 'stationId' } );
}
