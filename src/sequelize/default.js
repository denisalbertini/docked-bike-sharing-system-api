import { DataTypes } from 'sequelize';
import getTableName from './table-name-format.js';

const defaultAttributes = Object.freeze(
  {
    id: {
      type: DataTypes.UUID, 
      primaryKey: true
    }
  }
);

const defaultOptions = ( className ) => Object.freeze(
  {
    tableName: getTableName( className )
  }
);

export { defaultAttributes, defaultOptions };
