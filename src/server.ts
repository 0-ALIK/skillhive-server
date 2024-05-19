import express from 'express';
import { Routes } from './routes';
import { DatabaseConnectionService } from './services/database.connection';

export class Server {

    private app: express.Application = express();

    public async start(): Promise<void> {
        await DatabaseConnectionService.databaseConnection();

        this.healthCheck();

        this.globalMiddlewares();

        this.app.use(Routes.routes);

        this.app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT} and host ${process.env.HOST}`);
        });
    }

    // typeorm
    private databaseConnection(): void {
        // Aqui va la configuracion de la base de datos
        
    }

    private healthCheck(): void {
        this.app.get('/health', (req, res) => {
            res.send('OK');
        });
    }

    private globalMiddlewares(): void {
        this.app.use(express.json());
    }

}