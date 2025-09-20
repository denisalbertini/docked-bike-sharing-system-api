import BaseModel from './baseModel.js';
import { DataTypes } from 'sequelize';

export default class Biker extends BaseModel {
  static modelAttributes = {
    id: {
      type: DataTypes.UUID, 
      primaryKey: true
    }, 
    cpf: {
      type: DataTypes.CHAR( 11 ), 
      allowNull: false, 
      unique: true, 
      validate: {
        is: /\b\d{11}\b/
      }
    }, 
    name: {
      type: DataTypes.STRING, 
      allowNull: false, 
      validate: {
        is: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/
      }
    }, 
    birthDate: {
      type: DataTypes.DATEONLY, 
      allowNull: false, 
      validate: {
        isDate: true
      }
    }, 
    email: {
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true, 
      validate: {
        isEmail: true
      }
    }, 
    foreigner: {
      type: DataTypes.BOOLEAN, 
      allowNull: false, 
      validate: {
        isIn: [ [ true, false ] ]
      }
    }
  }
}
