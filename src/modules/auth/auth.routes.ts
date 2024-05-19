import { Router } from "express";
import { AuthController } from "./auth.controller";

export class AuthRoutes {

    public static get routes(): Router {
        const router = Router();

        const authController = new AuthController();

        router.get('/login', authController.login);

        return router;
    }
}