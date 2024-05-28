import { Request, Response } from "express";
import { validationResult } from "express-validator";

export function mostrarErrores(req: Request, res: Response, next: Function) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {

        const erroresFromat = errores.array().map(error => {
            return {msg: error.msg};
        });
        return res.status(400).json({erroresFromat});
    }

    next();
}