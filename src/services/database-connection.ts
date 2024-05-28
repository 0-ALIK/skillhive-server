import { DataSource } from 'typeorm';

export class DatabaseConnectionService {
    private static dataSource: DataSource;

    public static get connection(): DataSource {
        if (!DatabaseConnectionService.dataSource) {
            throw new Error('Database connection not established');
        }
        return DatabaseConnectionService.dataSource;
    }

    public static async databaseConnection(): Promise<DataSource> {
        try {
            if (!DatabaseConnectionService.dataSource) {
                DatabaseConnectionService.dataSource = new DataSource({
                    type: process.env.DB_TYPE as any || 'mysql',
                    host: process.env.DB_HOST || 'localhost',
                    port: Number(process.env.DB_PORT) || 3306,
                    username: process.env.DB_USER || 'root',
                    password: process.env.DB_PASS || '',
                    database: process.env.DB_NAME || 'skillhive-dev',
                    logging: process.env.DB_LOGS === 'true' ? true : false,
                    entities: ['src/entity/**/*.ts'],
                    migrations: ['src/migrations/**/*.ts'],
                    migrationsTableName: "_migration_table",
                    pool: {
                        max: 10,
                        min: 1, 
                        idleTimeoutMillis: 30000, 
                        acquireTimeoutMillis: 30000
                    }
                });

                await DatabaseConnectionService.dataSource.initialize();
                console.log('Database connected\n\n');
            }

            return DatabaseConnectionService.dataSource;
        } catch (error) {
            console.error('Error connecting to the database\n\n', error);
            throw error;
        }
    }
}
