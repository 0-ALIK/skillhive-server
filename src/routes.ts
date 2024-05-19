import { Router } from "express";
import { AuthRoutes } from "./modules/auth/auth.routes";

export class Routes {

    public static get routes(): Router {
        const router = Router();

        router.use('/api/auth', AuthRoutes.routes);

        return router;
    }
}