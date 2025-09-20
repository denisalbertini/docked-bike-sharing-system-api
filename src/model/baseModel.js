import { Model, DataTypes } from "sequelize";

export default class BaseModel extends Model {
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
      underscored: true, 
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
