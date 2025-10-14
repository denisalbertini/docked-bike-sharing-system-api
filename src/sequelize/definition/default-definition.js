import { DataTypes } from 'sequelize';

const defaultAttributes = Object.freeze(
  {
    id: {
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true
    }
  }
);

const defaultOptions = ( className ) => Object.freeze(
  {
    // PascalCase to snake_case
    tableName: className
      .replace( /([a-z0-9])([A-Z])/g, '$1_$2' )
      .toLowerCase()
  }
);

export { defaultAttributes, defaultOptions };
