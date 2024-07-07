import { Request, Response, NextFunction } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Publicacion } from '../../../entity/publicaciones/publicacion.entity';

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

            if(publicacion) {
                req.body.publicacion = publicacion;            
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si la publicación pertenece al usuario' });
        }
    }
}