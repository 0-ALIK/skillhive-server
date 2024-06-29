import { NextFunction, Request, Response } from "express";

export function log(req: Request, res: Response, next: NextFunction) {
    console.log(`========== [${new Date().toDateString()}] ${req.method} ${req.url} ==========`);
    next();
}