import { Sequelize } from "sequelize";
import initDefinitions from './definition/init-definitions.js';

const sequelize = new Sequelize(
  process.env.POSTGRESQL_CONNECTION_URI, 
  {
    logging: false, 
    define: { underscored: true, timestamps: false }
  }
);

await sequelize.authenticate();
console.log( 'Connection has been established successfully.' );

initDefinitions( sequelize );

export default sequelize;
