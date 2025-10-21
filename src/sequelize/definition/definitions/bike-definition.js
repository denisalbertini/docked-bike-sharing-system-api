import { DataTypes } from "sequelize";
import BikeAdmission from "../../../model/models/bike-admission.js";
import BikeRemoval from "../../../model/models/bike-removal.js";
import Bike from "../../../model/models/bike.js";
import Dock from "../../../model/models/dock.js";
import Rental from "../../../model/models/rental.js";
import status from "../../../model/shared/enum/bike-status.js";
import { defaultAttributes, defaultOptions } from "../default-definition.js";

export function defineModel( sequelize ) {
  Bike.init(
    {
      ...defaultAttributes, 
      bikeSerial: {
        type: DataTypes.CHAR( 6 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          is: /\bBI-\d{3}\b/
        }
      }, 
      brand: {
        type: DataTypes.STRING( 100 ), 
        allowNull: false, 
        validate: {
          len: [ 1, 100 ]
        }
      }, 
      model: {
        type: DataTypes.STRING( 100 ), 
        allowNull: false, 
        validate: {
          len: [ 1, 100 ]
        }
      }, 
      manufactureYear: {
        type: DataTypes.INTEGER, 
        allowNull: false, 
        validate: {
          is: /\b(19|20)\d{2}\b/
        }
      }, 
      status: {
        type: DataTypes.ENUM, 
        values: Object.values( status ), 
        allowNull: false, 
        defaultValue: status.NEW, 
        validate: {
          isIn: [ Object.values( status ) ]
        }
      }
    }, 
    {
      sequelize, 
      paranoid: true, 
      ...defaultOptions( Bike.name ), 
      hooks: {
        beforeCreate: ( bike, _options ) => {
          bike.status = status.NEW;
        }
      }
    }
  );
}

export function defineAssociations() {
  Bike.hasOne( Dock, { foreignKey: 'bikeId' } );
  Bike.hasMany(
    BikeAdmission, 
    { foreignKey: { name: 'bikeId', allowNull: false } }
  );
  Bike.hasMany( 
    BikeRemoval, 
    { foreignKey: { name: 'bikeId', allowNull: false } }
  );
  Bike.hasMany(
    Rental, 
    { foreignKey: { name: 'bikeId', allowNull: false } }
  );
}
