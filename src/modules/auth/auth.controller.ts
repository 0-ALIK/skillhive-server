import { Request, Response } from 'express';

export class AuthController { 

    // Para inyeccion de dependencias
    public constructor() {}

    public async login(req: Request, res: Response) {
        res.json({ message: 'Login' });
    }
}