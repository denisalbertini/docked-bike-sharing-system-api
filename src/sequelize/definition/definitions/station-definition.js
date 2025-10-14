import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default-definition.js";
import Station from "../../../model/models/station.js";
import Dock from "../../../model/models/dock.js";

function defineModel( sequelize ) {
  Station.init(
    {
      ...defaultAttributes, 
      serialNumber: {
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

function defineAssociations() {
  Station.hasMany( Dock, { foreignKey: 'stationId' } );
}

export { defineModel, defineAssociations };
