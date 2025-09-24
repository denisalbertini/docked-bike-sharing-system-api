import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );
const modelsPath = path.join( __dirname, 'sequelize', 'models' );

export default async function init( sequelize ) {
  const files = await readdir( modelsPath );
  const modules = [];

  await Promise.all(
    files.map(
      async file => {
        const modulePath = path.join( modelsPath, file );
        const moduleUrl = pathToFileURL( modulePath ).href;
        const module = await import( moduleUrl );
        modules.push( module );
      }
    )
  );

  await Promise.all(
    modules.map( module => module.default.init( sequelize ) )
  );

  await Promise.all(
    modules.map( module => module.default.defineAssociations() )
  );
}
