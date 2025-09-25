import BaseModel from '../baseModel.js';
import errorMessages from '../enum/errorMessages.js';
import { DataTypes } from 'sequelize';
import Rental from './rental.js';
import Biker from './biker.js';

export default class Charge extends BaseModel {
  constructor() {
    throw new Error( errorMessages.modelConstructorMessage );
  }

  static modelAttributes = {
    requestedAt: {
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW
    }, 
    completedAt: DataTypes.DATE, 
    amount: {
      type: DataTypes.DECIMAL( 10, 2 ), 
      allowNull: false, 
      validate: {
        isDecimal: true
      }
    }
  }

  static defineAssociations() {
    this.hasMany(
      Rental, 
      {
        as: 'initialCharge', 
        foreignKey: { name: 'initial_charge_id', allowNull: false }
      }
    );
    this.hasMany(
      Rental, 
      {
        as: 'extraCharge', 
        foreignKey: 'extra_charge_id'
      }
    );
    this.belongsTo(
      Biker, 
      { foreignKey: { allowNull: false } }
    );
  }
}
