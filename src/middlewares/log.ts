import { NextFunction, Request, Response } from "express";

function obtenerFechaCompleta(fecha: Date): string {
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; 
    const año = fecha.getFullYear();
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();
  
    return `${dia}/${mes}/${año} ${hora}:${minutos}:${segundos}`;
}

export function log(req: Request, res: Response, next: NextFunction) {
    console.log(`\n\n========== ${obtenerFechaCompleta(new Date())} | ${req.method} | ${req.url} | ${req.ip} ==========`);
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    console.log(`Request Query: ${JSON.stringify(req.query)}`);
    console.log(`Request Params: ${JSON.stringify(req.params)}`);
    next();
}