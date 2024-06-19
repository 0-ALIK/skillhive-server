import { NextFunction, Request, Response } from "express";

export function filesToBody(req: Request, res: Response, next: NextFunction) {
    if (req.files) {
        Object.keys(req.files).forEach(key => {
            if(req.files) {
                req.body[key] = req.files[key];
            }
        });
    }

    next();
}