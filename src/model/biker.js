import { Model, DataTypes } from 'sequelize';

export default class Biker extends Model {
  static init( connectionInstance ) {
    super.init(
      {
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
          }, 
          field: 'birth_date'
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
      }, 
      {
        connectionInstance, 
        modelName: 'Biker', 
        tableName: 'biker'
      }
    );
  }
}
