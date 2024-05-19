import 'dotenv/config';
import 'reflect-metadata';

import { Server } from "./server";

( async() => {
    
    const server = new Server();
    await server.start();

})();