import { Model, DataTypes } from "sequelize";
import { bikeStatus } from "../status.js";

export default class Bike extends Model {
  static init( connectionInstance ) {
    super.init(
      {
        id: {
          type: DataTypes.UUID, 
          primaryKey: true
        }, 
        serialNumber: {
          type: DataTypes.INTEGER, 
          allowNull: false, 
          unique: true, 
          validate: {
            isInt: true
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
          }, 
          field: 'manufacture_year'
        }, 
        status: {
          type: DataTypes.ENUM, 
          values: bikeStatus, 
          allowNull: false, 
          defaultValue: 'NEW', 
          validate: {
            isIn: [ bikeStatus ]
          }
        }
      }, 
      {
        connectionInstance, 
        modelName: 'Bike', 
        tableName: 'bike'
      }
    );
  }
}
