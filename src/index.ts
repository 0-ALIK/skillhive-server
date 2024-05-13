import 'dotenv/config';
import 'reflect-metadata';

import { Server } from "./server";

( async() => {
    Server.start();
})();