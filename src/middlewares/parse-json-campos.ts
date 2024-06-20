import { NextFunction, Request, Response } from "express";

export function parseJsonCampos( campos: string[] ) {
    return (req: Request, res: Response, next: NextFunction) => {
        campos.forEach( campo => {
            if( req.body[campo] ) {
                req.body[campo] = JSON.parse( req.body[campo] );
            }
        });
        next();
    }
}