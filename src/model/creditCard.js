import { Model, DataTypes } from 'sequelize';

export default class CreditCard extends Model {
  static init( connectionInstance ) {
    super.init(
      {
        id: {
          type: DataTypes.UUID, 
          primaryKey: true
        }, 
        number: {
          type: DataTypes.CHAR( 19 ), 
          allowNull: false, 
          unique: true, 
          validate: {
            is: /\b\d{19}\b/
          }
        }, 
        holderName: {
          type: DataTypes.STRING, 
          allowNull: false, 
          validate: {
            is: /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/
          }, 
          field: 'holder_name'
        }, 
        expirationDate: {
          type: DataTypes.DATEONLY, 
          allowNull: false, 
          validate: {
            isDate: true
          }, 
          field: 'expiration_date'
        }, 
        cvv: {
          type: DataTypes.CHAR( 3 ), 
          allowNull: false, 
          validate: {
            is: /\b\d{3}\b/
          }
        }
      }, 
      {
        connectionInstance, 
        modelName: 'CreditCard', 
        tableName: 'credit_card'
      }
    );
  }
}
