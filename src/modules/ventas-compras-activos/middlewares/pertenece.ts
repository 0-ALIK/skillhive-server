import { NextFunction, Request, Response } from "express";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Activo } from "../../../entity/activos/activos";
import { Publicacion } from "../../../entity/publicaciones/publicacion.entity";

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

export function publicacionPerteneceUsuario(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { publicacionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(publicacionid),
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    }
                }
            });

            if (pertenece && !publicacion) {
                return res.status(400).json({ message: 'La publicación no pertenece al usuario' });
            }

            if (!pertenece && publicacion) {
                return res.status(400).json({ message: 'La publicación pertenece al usuario' });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si la publicación pertenece al usuario' });
        }
    }
}