import { Router } from "express";
import { VentasComprasActivosController } from './controllers/ventas-compras-activos.controller';

export class VentasComprasActivosRoutes {

    public static get routes(): Router {
        const router = Router();

        const ventasComprasActivosController = new VentasComprasActivosController();

        return router;
    }
}