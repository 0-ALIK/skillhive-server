import { Request, Response, NextFunction } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Seccion } from '../../../entity/secciones/seccion.entity';
import { ProyectosSeccion } from '../../../entity/secciones/proyectos_seccion.entity';
import { ArchivosSeccion } from '../../../entity/secciones/archivos_seccion.entity';

export function seccionPerteneceUsuario(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { seccionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const seccion = await dataSource.getRepository(Seccion).findOne({
                where: {
                    id: Number(seccionid),
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                }
            });

            if (pertenece && !seccion) {
                return res.status(400).json({ message: 'La sección no pertenece al usuario' });
            }

            if (!pertenece && seccion) {
                return res.status(400).json({ message: 'La sección pertenece al usuario' });
            }

            if(seccion) {
                req.body.seccion = seccion;
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si la sección pertenece al usuario' });
        }
    }
}

export function proyectoSeccionPerteneceUsuario(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { proyectoid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {

            const proyecto = await dataSource.getRepository(ProyectosSeccion).findOne({
                where: {
                    id: Number(proyectoid),
                    seccion: {
                        usuario: { id: Number(usuarioAuth.id_usuario) }
                    }
                }
            });

            if (pertenece && !proyecto) {
                return res.status(400).json({ message: 'El proyecto no pertenece al usuario' });
            }

            if (!pertenece && proyecto) {
                return res.status(400).json({ message: 'El proyecto pertenece al usuario' });
            }

            if(proyecto) {
                req.body.proyecto = proyecto;
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si la sección pertenece al usuario' });
        }
    }
}

export function archivoSeccionPerteneceUsuario(pertenece: boolean = true) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { archivoid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {

            const archivo = await dataSource.getRepository(ArchivosSeccion).findOne({
                where: {
                    id: Number(archivoid),
                    seccion: {
                        usuario: { id: Number(usuarioAuth.id_usuario) }
                    }
                }
            });

            if (pertenece && !archivo) {
                return res.status(400).json({ message: 'El archivo no pertenece al usuario' });
            }

            if (!pertenece && archivo) {
                return res.status(400).json({ message: 'El archivo pertenece al usuario' });
            }

            if(archivo) {
                req.body.archivo = archivo;
            }

            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si el archivo pertenece al usuario' });
        }
    }
}