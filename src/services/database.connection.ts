import { DataSource } from "typeorm";

export class DatabaseConnectionService {
    
    public static async databaseConnection(): Promise<void> {
        try {

            const dataSource = new DataSource({
                type: process.env.DB_TYPE as any || 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 3306,
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'skillhive-dev',
                logging: process.env.DB_LOGS === 'true' ? true : false,
                
                entities: ['src/entity/**/*.entity.ts']   
            });
    
            await dataSource.initialize();
            console.log('Database connected\n\n');
            
        } catch (error) {
            console.error('Error connecting to the database\n\n', error);
        }
    }
}