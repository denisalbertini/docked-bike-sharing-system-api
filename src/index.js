import '@dotenvx/dotenvx/config';
import app from './express/app.js';

const PORT = 3000;

app.listen( PORT, () => console.log( `Server running on port ${ PORT }.` ) );
