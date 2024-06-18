import { Router } from "express";
import { VentasComprasActivosController } from './ventas-compras-activos.controller';

export class VentasComprasActivosRoutes {

    public static get routes(): Router {
        const router = Router();

        const ventasComprasActivosController = new VentasComprasActivosController();

        return router;
    }
}