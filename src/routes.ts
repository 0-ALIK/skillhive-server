import { Router } from "express";
import { AuthRoutes } from "./modules/auth/auth.routes";
import { VentasComprasActivosRoutes } from "./modules/ventas-compras-activos/ventas-compras-activos.routes";
import { GestionPublicacionesRoutes } from "./modules/gestion-publicaciones/gestion-publicaciones.routes";
import { PerfilUsuarioRoutes } from "./modules/perfil-usuario/perfil-usuario.routes";

export class Routes {

    public static get routes(): Router {
        const router = Router();

        router.use('/api/auth', AuthRoutes.routes);
        router.use('/api/ventas-compras-activos', VentasComprasActivosRoutes.routes);
        router.use('/api/gestion-publicaciones', GestionPublicacionesRoutes.routes);
        router.use('/api/perfil-usuario', PerfilUsuarioRoutes.routes)

        return router;
    }
}