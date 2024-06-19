import { Router } from "express";
import { AuthRoutes } from "./modules/auth/auth.routes";
import { VentasComprasActivosRoutes } from "./modules/ventas-compras-activos/ventas-compras-activos.routes";

export class Routes {

    public static get routes(): Router {
        const router = Router();

        router.use('/api/auth', AuthRoutes.routes);
        router.use('/api/ventas-compras-activos', VentasComprasActivosRoutes.routes);

        return router;
    }
}