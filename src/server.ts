import express from 'express';
import { Routes } from './routes';
import { DatabaseConnectionService } from './services/database-connection';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';

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

        this.public();

        this.app.listen(process.env.PORT || 3000, () => {
            console.log(`El servidor esta corriendo en el puerto ${process.env.PORT} y host ${process.env.HOST}\n-> http://${process.env.HOST}:${process.env.PORT}`);
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
        // Middleware para habilitar CORS
        this.app.use(cors());
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

    /**
     * Rutas públicas
     */
    private public(): void {
        this.app.use(express.static(path.join(__dirname, '../public')));

        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });
    }

}