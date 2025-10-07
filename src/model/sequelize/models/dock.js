import BaseModel from '../base-model.js';
import { DataTypes, ForeignKeyConstraintError } from 'sequelize';
import status from '../../shared/enum/dock-status.js';
import BikeAdmission from './bike-admission.js';
import DockAdmission from './dock-admission.js';
import DockRemoval from './dock-removal.js';
import Rental from './rental.js';
import Bike from './bike.js';
import Station from './station.js';

export default class Dock extends BaseModel {
  static modelAttributes = {
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
  }

  static modelOptions = {
    paranoid: true, 
    hooks: {
      beforeDestroy: ( dock, _options ) => {
        if ( dock.bikeId !== null )
          throw new ForeignKeyConstraintError( 'Dock has a bike attached.' );
      }
    }
  }

  static defineAssociations() {
    this.hasMany(
      BikeAdmission, 
      { foreignKey: { allowNull: false } }
    );
    this.hasMany(
      DockAdmission, 
      { foreignKey: { allowNull: false } }
    );
    this.hasMany(
      DockRemoval, 
      { foreignKey: { allowNull: false } }
    );
    this.hasMany(
      Rental, 
      {
        as: 'rentedFromDock', 
        foreignKey: { name: 'rented_from_dock_id', allowNull: false }
      }
    );
    this.hasMany(
      Rental, 
      {
        as: 'returnedToDock', 
        foreignKey: { name: 'returned_to_dock_id' }
      }
    );
    this.belongsTo( Bike );
    this.belongsTo( Station );
  }
}
