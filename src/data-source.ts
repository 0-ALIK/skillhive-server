import 'reflect-metadata';
import 'dotenv/config';

import { DataSource } from 'typeorm';

export const dataSource = new DataSource({
    type: process.env.DB_TYPE as any || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'skillhive-dev',
    logging: process.env.DB_LOGS === 'true' ? true : false,
    entities: ['src/entities/**/*.ts'],
    migrations: ['src/migrations/**/*.ts'],
    migrationsTableName: "_migration_table",
    pool: {
        max: 10,
        min: 1, 
        idleTimeoutMillis: 30000, 
        acquireTimeoutMillis: 30000
    }
});