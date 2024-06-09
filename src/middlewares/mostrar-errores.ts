import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function mostrarErrores(req: Request, res: Response, next: NextFunction) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {

        const erroresFromat = errores.array().map(error => {
            return {msg: error.msg};
        });
        return res.status(400).json({errores: erroresFromat});
    }

    next();
}