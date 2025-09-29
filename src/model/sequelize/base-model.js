import { Model, DataTypes } from 'sequelize';
import {
  getBaseClassConstructorMessage, 
  getSequelizeModelConstructorMessage
} from '../../constructor-error-message.js';

export default class BaseModel extends Model {
  constructor() {
    const className = new.target.name;

    const message =
      className === BaseModel ? 
      getBaseClassConstructorMessage( className ) : 
      getSequelizeModelConstructorMessage( className );

    throw new Error( message );
  }

  static get defaultAttributes() {
    return {
      id: {
        type: DataTypes.UUID, 
        primaryKey: true
      }
    };
  }
  
  static get defaultOptions() {
    return {
      tableName: this.getTableName(), 
      timestamps: false
    };
  }

  static getTableName() {
    return this.name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
  }
  
  static init( sequelize ) {
    if ( this.name === 'BaseModel' ) return;

    const attributes = {
      ...this.defaultAttributes, 
      ...this.modelAttributes
    }
    
    const options = {
      sequelize, 
      ...this.defaultOptions, 
      ...( this.modelOptions || {} )
    };

    super.init( attributes, options );
  }
}
