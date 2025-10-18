import { DataTypes } from "sequelize";
import Dock from "../../../model/models/dock.js";
import Station from "../../../model/models/station.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
  Station.init(
    {
      ...defaultAttributes, 
      stationSerial: {
        type: DataTypes.CHAR( 6 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          is: /\bST-\d{3}\b/
        }
      }, 
      name: {
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: {
          len: [ 1, 256 ]
        }
      }, 
      location: {
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: {
          len: [ 1, 256 ]
        }
      }
    }, 
    {
      sequelize, 
      ...defaultOptions( Station.name )
    }
  );
}

export function defineAssociations() {
  Station.hasMany( Dock, { foreignKey: 'stationId' } );
}
