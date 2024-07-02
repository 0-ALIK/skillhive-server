import { NextFunction, Request, Response } from "express";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Activo } from "../../../entity/activos/activos";
import { Comision } from "../../../entity/comisiones/comision.entity";
import { ComisionSolicitud } from "../../../entity/comisiones/comision_solicitud.entity";

export function activoPerteneceUsuario(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { activoid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const activo = await dataSource.getRepository(Activo).findOne({
                where: {
                    id: Number(activoid),
                    publicacion: {
                        usuario: {
                            id: Number(usuarioAuth.id_usuario)
                        }
                    }
                }
            });

            if (pertenece && !activo) {
                return res.status(400).json({ message: 'El activo no pertenece al usuario' });
            }

            if (!pertenece && activo) {
                return res.status(400).json({ message: 'El activo pertenece al usuario' });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si el activo pertenece al usuario' });
        }
    }
}

export function comisionPerteceUsuario(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { comisionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const comision = await dataSource.getRepository(Comision).findOne({
                where: {
                    id: Number(comisionid),
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    }
                }
            });

            if (pertenece && !comision) {
                return res.status(400).json({ message: 'La comisión no pertenece al usuario' });
            }

            if (!pertenece && comision) {
                return res.status(400).json({ message: 'La comisión pertenece al usuario' });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si la comisión pertenece al usuario' });
        }
    }
}   

export function solicitudComisionPerteneceUsuario(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { solicitudid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const solicitud = await dataSource.getRepository(ComisionSolicitud).findOne({
                where: {
                    id: Number(solicitudid),
                    comision: {
                        usuario: {
                            id: Number(usuarioAuth.id_usuario)
                        }
                    }
                }
            });

            if (pertenece && !solicitud) {
                return res.status(400).json({ message: 'La solicitud no pertenece al usuario' });
            }

            if (!pertenece && solicitud) {
                return res.status(400).json({ message: 'La solicitud pertenece al usuario' });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si la solicitud pertenece al usuario' });
        }
    }
}

export function solicitudComisionPerteneceUsuarioCliente(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { solicitudid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const solicitud = await dataSource.getRepository(ComisionSolicitud).findOne({
                where: {
                    id: Number(solicitudid),
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    }
                }
            });

            if (pertenece && !solicitud) {
                return res.status(400).json({ message: 'La solicitud no pertenece al usuario' });
            }

            if (!pertenece && solicitud) {
                return res.status(400).json({ message: 'La solicitud pertenece al usuario' });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si la solicitud pertenece al usuario' });
        }
    }
}