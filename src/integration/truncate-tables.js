import sequelize from '../sequelize/sequelize.js';

export default async function truncateAllTables() {
  const query = 
  `
  SELECT table_name
  FROM information_schema.tables
  WHERE 
    table_schema = 'public' AND 
    table_type = 'BASE TABLE'
  `;

  const [ results ] = await sequelize.query( query );
  const tables = results.map( ( t ) => `"${ t.table_name }"`).join(", ");

  if ( tables ) await sequelize.query(
    `TRUNCATE TABLE ${ tables } RESTART IDENTITY CASCADE;`
  );
}
