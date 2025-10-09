import '@dotenvx/dotenvx/config';
import sequelize from './sequelize/sequelize.js';
import initORM from './sequelize/index.js';

try {
  await sequelize.authenticate();
  console.log( 'Connection has been established successfully.' );
} catch ( error ) {
  console.error( 'Unable to connect to the database:', error );
}

await initORM( sequelize );

await sequelize.sync( { force: true } );

await sequelize.close();
