import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { TipoSeccion } from '../../../entity/secciones/tipo_seccion.entity';
import { Seccion } from '../../../entity/secciones/seccion.entity';
import { Not } from 'typeorm';

export class SeccionesController {

    public async obtenerTiposSecciones(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;
        try {
            const tiposSecciones = await dataSource.getRepository(TipoSeccion).find();
            res.json(tiposSecciones);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al obtener los tipos de secciones'});
        }
    }

    public async obtenerSeccionesPropias(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const secciones = await dataSource.getRepository(Seccion).find({
                where: {
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                },
                order: {
                    orden: 'ASC'
                },
                relations: {
                    tipoSeccion: true,
                    textoSeccion: true,
                    proyectosSeccion: true,
                    archivosSeccion: true
                }
            });

            res.json(secciones);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al obtener las secciones'});
        }
    }

    public async crearSeccion(req: Request, res: Response) {
        const { tipo_seccion, titulo, usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;
        
        try {

            let secciones = null;

            await dataSource.transaction(async transaction => {

                const seccion = Seccion.create({
                    tipoSeccion: { id: tipo_seccion },
                    titulo,
                    usuario: { id: Number(usuarioAuth.id_usuario) },
                    orden: 1
                });

                const seccionSaved = await transaction.save(seccion);

                await transaction.update(Seccion, {
                    usuario: { id: Number(usuarioAuth.id_usuario) },
                    id: Not(seccionSaved.id)
                }, {
                    orden: () => 'orden + 1'
                });

                secciones = await transaction.getRepository(Seccion).find({
                    where: {
                        usuario: { id: Number(usuarioAuth.id_usuario) }
                    },
                    order: {
                        orden: 'ASC'
                    },
                    relations: {
                        tipoSeccion: true,
                        textoSeccion: true,
                        proyectosSeccion: true,
                        archivosSeccion: true
                    }
                });
            });

            res.json({message: 'Seccion creada correctamente', secciones});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al crear la seccion'});
        }
    }

    public async cambiarOrdenSeccion(req: Request, res: Response) {
        const { seccionid, direction } = req.params;
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
    
            let secciones = await dataSource.getRepository(Seccion).find({
                where: {
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                },
                order: { orden: 'ASC' }
            });

            await dataSource.transaction(async transaction => {
                const seccion = secciones.find(s => s.id === Number(seccionid));

                if (!seccion) {
                    return res.status(400).json({message: 'La seccion no existe'});
                }

                if (direction === 'up' && seccion.orden === 1) {
                    return res.status(400).json({message: 'La seccion ya esta en la primera posicion'});
                }

                if (direction === 'down' && seccion.orden === secciones.length) {
                    return res.status(400).json({message: 'La seccion ya esta en la ultima posicion'});
                }

                if (direction === 'up') {
                    await transaction.update(Seccion, {
                        usuario: { id: Number(usuarioAuth.id_usuario) },
                        orden: seccion.orden - 1
                    }, {
                        orden: seccion.orden
                    });

                    await transaction.update(Seccion, {
                        id: seccion.id
                    }, {
                        orden: seccion.orden - 1
                    });
                }

                if (direction === 'down') {
                    await transaction.update(Seccion, {
                        usuario: { id: Number(usuarioAuth.id_usuario) },
                        orden: seccion.orden + 1
                    }, {
                        orden: seccion.orden
                    });

                    await transaction.update(Seccion, {
                        id: seccion.id
                    }, {
                        orden: seccion.orden + 1
                    });
                }
            });

            secciones = await dataSource.getRepository(Seccion).find({
                where: {
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                },
                order: { orden: 'ASC' }
            });

            res.json({message: 'Orden de la seccion cambiado correctamente'});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al cambiar el orden de la seccion'});
        }
    }

}