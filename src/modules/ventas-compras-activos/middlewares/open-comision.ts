import { NextFunction, Request, Response } from "express";

export async function openComision(req: Request, res: Response, next: NextFunction) {
    const { usuarioAuth } = req.body;

    if(!usuarioAuth.open_comissions) {
        return res.status(401).json({ message: 'No tienes las comisiones activadas para realizar esta accion' });
    }
    
    next();
}