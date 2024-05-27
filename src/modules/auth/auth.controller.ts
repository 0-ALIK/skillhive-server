import { Request, Response } from 'express';
import { JWTService } from '../../services/jwt';

export class AuthController { 

    // Para inyeccion de dependencias
    public constructor() {}

    public async login(req: Request, res: Response) {
        
        res.json({ message: 'Login' });
    }
}