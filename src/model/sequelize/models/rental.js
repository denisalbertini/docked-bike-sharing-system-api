import BaseModel from '../baseModel.js';
import errorMessages from '../enum/errorMessages.js';
import { DataTypes } from 'sequelize';
import Bike from './bike.js';
import Biker from './biker.js';
import Charge from './charge.js';
import Dock from './dock.js';

export default class Rental extends BaseModel {
  constructor() {
    throw new Error( errorMessages.SEQUELIZE_MODEL_CONSTRUCTOR_MSG );
  }

  static modelAttributes = {
    startedAt: {
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW
    }, 
    finishedAt: DataTypes.DATE
  }

  static defineAssociations() {
    this.belongsTo(
      Bike, 
      { foreignKey: { allowNull: false } }
    );
    this.belongsTo(
      Biker, 
      { foreignKey: { allowNull: false } }
    );
    this.belongsTo(
      Charge, 
      {
        as: 'initialCharge', 
        foreignKey: { name: 'initial_charge_id', allowNull: false }
      }
    );
    this.belongsTo(
      Charge, 
      {
        as: 'extraCharge', 
        foreignKey: { name: 'extra_charge_id' }
      }
    );
    this.belongsTo(
      Dock, 
      {
        as: 'rentedFromDock', 
        foreignKey: { name: 'rented_from_dock_id', allowNull: false }
      }
    );
    this.belongsTo(
      Dock, 
      {
        as: 'returnedToDock', 
        foreignKey: { name: 'returned_to_dock_id' }
      }
    );
  }
}
