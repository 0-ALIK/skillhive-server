import { Request, Response, NextFunction } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Seccion } from '../../../entity/secciones/seccion.entity';

export function seccionPerteneceUsuario(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { seccionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const seccion = await dataSource.getRepository(Seccion).findOne({
                where: {
                    id: Number(seccionid),
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    }
                }
            });

            if (pertenece && !seccion) {
                return res.status(400).json({ message: 'La sección no pertenece al usuario' });
            }

            if (!pertenece && seccion) {
                return res.status(400).json({ message: 'La sección pertenece al usuario' });
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si la sección pertenece al usuario' });
        }
    }
}