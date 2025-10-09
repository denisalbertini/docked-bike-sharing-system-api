import { DataTypes } from "sequelize";
import { defaultAttributes, defaultOptions } from "../default.js";
import Bike from "../../model/models/bike.js";
import status from "../../model/shared/enum/bike-status.js";
import Dock from "../../model/models/dock.js";
import BikeAdmission from "../../model/models/bike-admission.js";
import BikeRemoval from "../../model/models/bike-removal.js";
import Rental from "../../model/models/rental.js";

function defineModel( sequelize ) {
  Bike.init(
    {
      ...defaultAttributes, 
      serialNumber: {
        type: DataTypes.CHAR( 6 ), 
        allowNull: false, 
        unique: true, 
        validate: {
          is: /\bBI-\d{3}\b/
        }
      }, 
      brand: {
        type: DataTypes.STRING( 100 ), 
        allowNull: false
      }, 
      model: {
        type: DataTypes.STRING( 100 ), 
        allowNull: false
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
      ...defaultOptions( Bike.name )
    }
  );
}

function defineAssociations() {
  Bike.hasOne( Dock );
  Bike.hasMany(
    BikeAdmission, 
    { foreignKey: { allowNull: false } }
  );
  Bike.hasMany( 
    BikeRemoval, 
    { foreignKey: { allowNull: false } }
  );
  Bike.hasMany(
    Rental, 
    { foreignKey: { allowNull: false } }
  );
}

export { defineModel, defineAssociations };
