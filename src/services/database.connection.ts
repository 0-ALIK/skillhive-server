import { DataSource } from 'typeorm';
import { dataSource } from '../data-source';

export class DatabaseConnectionService {
    private static dataSource: DataSource;

    public static async databaseConnection(): Promise<DataSource> {
        try {
            if (!DatabaseConnectionService.dataSource) {
                DatabaseConnectionService.dataSource = dataSource;

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
