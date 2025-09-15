import { Model, DataTypes } from 'sequelize';
import { dockStatus } from '../status.js';

export default class Dock extends Model {
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
          }, 
          field: 'serial_number'
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
          }, 
          field: 'manufacture_date'
        }, 
        status: {
          type: DataTypes.ENUM(), 
          values: dockStatus, 
          allowNull: false, 
          defaultValue: 'OPERATIONAL', 
          validate: {
            isIn: [ dockStatus ]
          }
        }
      }, 
      {
        connectionInstance, 
        modelName: 'Dock', 
        tableName: 'dock'
      }
    );
  }
}
