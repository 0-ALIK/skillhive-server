import express from 'express';
import { Routes } from './routes';
import { DatabaseConnectionService } from './services/database-connection';
import fileUpload from 'express-fileupload';

export class Server {

    /**
     * Aplicación express
     */
    private app: express.Application = express();
    
    /**
     * Inicia el servidor
     */
    public async start(): Promise<void> {
        
        await this.databaseConnection();

        this.healthCheck();

        this.globalMiddlewares();

        this.app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT} and host ${process.env.HOST}`);
        });
    }

    /**
     * Conexión a la base de datos
     */
    private async databaseConnection(): Promise<void> {
        await DatabaseConnectionService.databaseConnection();
    }

    /**
     * Health check
     */
    private healthCheck(): void {
        this.app.get('/health', (req, res) => {
            res.send('OK');
        });
    }

    /**
     * Middlewares globales
     */
    private globalMiddlewares(): void {
        // Middleware para parsear el body de las peticiones
        this.app.use(express.json());
        // Middleware para subir archivos
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/'
        }));
        
        // Middleware para las rutas
        this.app.use(Routes.routes);
    }

}