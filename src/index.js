import '@dotenvx/dotenvx/config';
import sequelize from './sequelize/sequelize.js';
import initORM from './sequelize/definition/init-definitions.js';
import app from './express/app.js';

try {
  await sequelize.authenticate();
  console.log( 'Connection has been established successfully.' );
} catch ( error ) {
  console.error( 'Unable to connect to the database:', error );
}

await initORM( sequelize );

await sequelize.sync( { force: true } );

const PORT = 3000;

app.listen( PORT, () => console.log( `Server running on port ${ PORT }.` ) );
