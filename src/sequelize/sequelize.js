import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.POSTGRESQL_CONNECTION_URI, 
  {
    logging: false, 
    define: { underscored: true, timestamps: false }
  }
);

export default sequelize;
