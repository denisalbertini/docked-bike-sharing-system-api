import { Model, DataTypes } from "sequelize";

export default class Station extends Model {
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
        name: {
          type: DataTypes.STRING, 
          allowNull: false
        }, 
        location: {
          type: DataTypes.STRING, 
          allowNull: false
        }
      }, {
        connectionInstance, 
        modelName: 'Station', 
        tableName: 'station'
      }
    );
  }
}
