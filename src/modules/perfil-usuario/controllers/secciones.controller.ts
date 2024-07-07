import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { TipoSeccion, TipoSeccionEnum } from '../../../entity/secciones/tipo_seccion.entity';
import { Seccion } from '../../../entity/secciones/seccion.entity';
import { MoreThan, Not,  } from 'typeorm';
import { ProyectosSeccion } from '../../../entity/secciones/proyectos_seccion.entity';
import { FileUploadService } from '../../../services/file-upload';
import { ArchivosSeccion } from '../../../entity/secciones/archivos_seccion.entity';
import { TextoSeccion } from '../../../entity/secciones/texto_seccion.entity';

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

    public async editarSeccion(req: Request, res: Response) {
        const { seccionid } = req.params;
        const { titulo } = req.body;
        const dataSource = DatabaseConnectionService.connection;
        try {
            await dataSource.getRepository(Seccion).update(seccionid, {
                titulo
            });

            res.json({message: 'Seccion editada correctamente'});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al editar la seccion'});
        }
    }

    public async eliminarSeccion(req: Request, res: Response) {
        const { seccionid } = req.params;
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {

            await dataSource.transaction(async transaction => { try {

                const seccion = await transaction.getRepository(Seccion).findOne({
                    where: {
                        id: Number(seccionid),
                        usuario: { id: Number(usuarioAuth.id_usuario) }
                    },
                    relations: {
                        tipoSeccion: true,
                        proyectosSeccion: true,
                        archivosSeccion: true,
                        textoSeccion: true
                    }
                });

                if (!seccion) {
                    throw new Error('La seccion no existe');
                }

                if(seccion.tipoSeccion.id === TipoSeccionEnum.GALERIA) {
                    const deleteArchivosPromise = seccion.archivosSeccion.map(async archivo => {
                        const deleteResult = await FileUploadService.delete(archivo.archivo);
                        if (!deleteResult.correct) {
                            throw new Error('Error al eliminar el archivo de la seccion');
                        }
                    });

                    await Promise.all(deleteArchivosPromise);
                }

                if(seccion.tipoSeccion.id === TipoSeccionEnum.PROYECTOS) {
                    const deleteProyectosPromise = seccion.proyectosSeccion.map(async proyecto => {
                        const deleteResult = await FileUploadService.delete(proyecto.imagen);
                        if (!deleteResult.correct) {
                            throw new Error('Error al eliminar la imagen del proyecto');
                        }
                    });

                    await Promise.all(deleteProyectosPromise);
                }

                await transaction.getRepository(Seccion).update({
                    usuario: { id: Number(usuarioAuth.id_usuario) },
                    id: Not(Number(seccionid)),
                    orden: MoreThan(seccion.orden)
                }, {
                    orden: () => 'orden - 1'
                });

                await transaction.getRepository(Seccion).delete({
                    id: Number(seccionid),
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                });
                
            } catch (error) {
                console.error(error);
                throw new Error('Error al eliminar la seccion');
            }});

            res.json({message: 'Seccion eliminada correctamente'});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al eliminar la seccion'});
        }
    }

    public async agregarProyectoSeccion(req: Request, res: Response) {
        const { seccionid } = req.params;
        const { nombre, descripcion, imagen, enlace, fecha_inicio, fecha_fin, usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const uploadResult = await FileUploadService.upload(imagen);

            if (!uploadResult.correct) {
                return res.status(400).json({message: 'Error al subir la imagen'});
            }

            const poyectoSeccion = ProyectosSeccion.create({
                nombre,
                descripcion,
                imagen: uploadResult.url,
                enlace,
                fecha_inicio,
                fecha_fin,
                seccion: { id: Number(seccionid) }
            });

            await dataSource.getRepository(ProyectosSeccion).save(poyectoSeccion);

            res.json({message: 'Proyecto agregado a la seccion correctamente'});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al agregar el proyecto a la seccion'});
        }
    }

    public async eliminarProyectoSeccion(req: Request, res: Response) {
        const { proyectoid, seccionid } = req.params;
        const { usuarioAuth, proyecto } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            
            const deleteResult = await FileUploadService.delete(proyecto.imagen);

            if (!deleteResult.correct) {
                return res.status(400).json({message: 'Error al eliminar la imagen del proyecto'});
            }

            await dataSource.getRepository(ProyectosSeccion).delete({
                id: Number(proyectoid),
                seccion: { 
                    id: Number(seccionid),
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                },
            });

            res.json({message: 'Proyecto eliminado de la seccion correctamente'});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al eliminar el proyecto de la seccion'});
        }
    }

    public async editarProyectoSeccion(req: Request, res: Response) {
        const { proyectoid, seccionid } = req.params;
        const { nombre, descripcion, imagen, enlace, fecha_inicio, fecha_fin, usuarioAuth, proyecto } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            let imagenUrl = proyecto.imagen;

            if (imagen) {
                const uploadResult = await FileUploadService.upload(imagen);

                if (!uploadResult.correct) {
                    return res.status(400).json({message: 'Error al subir la imagen'});
                }

                const deleteResult = await FileUploadService.delete(proyecto.imagen);

                if (!deleteResult.correct) {
                    return res.status(400).json({message: 'Error al eliminar la imagen del proyecto'});
                }

                imagenUrl = uploadResult.url;
            }

            await dataSource.getRepository(ProyectosSeccion).update(proyectoid, {
                nombre: nombre || proyecto.nombre,
                descripcion: descripcion || proyecto.descripcion,
                imagen: imagenUrl,
                enlace: enlace || proyecto.enlace,
                fecha_inicio: fecha_inicio || proyecto.fecha_inicio,
                fecha_fin: fecha_fin || proyecto.fecha_fin
            });

            res.json({message: 'Proyecto editado correctamente'});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al editar el proyecto'});
        }
    }

    public async editarTextoSeccion(req: Request, res: Response) {
        const { seccionid } = req.params;
        const { texto } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const textoSeccion = await dataSource.getRepository(TextoSeccion).findOne({
                where: {
                    seccion: { id: Number(seccionid) }
                }
            });

            if(!textoSeccion) {
                const textoSeccion = TextoSeccion.create({
                    texto,
                    seccion: { id: Number(seccionid) }
                });

                await dataSource.getRepository(TextoSeccion).save(textoSeccion);

                return res.json({message: 'Texto de la seccion fue creado correctamente'});
            }

            await dataSource.getRepository(TextoSeccion).update({
                seccion: { id: Number(seccionid) }
            }, {
                texto
            });

            res.json({message: 'Texto de la seccion fue editado correctamente'});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al editar el texto de la seccion'});
        }
    }

    public async agregarArchivoSeccion(req: Request, res: Response) {
        const { seccionid } = req.params;
        const { archivo } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const uploadResult = await FileUploadService.upload(archivo);

            if (!uploadResult.correct) {
                return res.status(400).json({message: 'Error al subir el archivo'});
            }

            const archivoSeccion = ArchivosSeccion.create({
                archivo: uploadResult.url,
                seccion: { id: Number(seccionid) }
            });

            await dataSource.getRepository(ArchivosSeccion).save(archivoSeccion);

            res.json({message: 'Archivo agregado a la seccion correctamente'});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al agregar el archivo a la seccion'});
        }
    }

    public async eliminarArchivoSeccion(req: Request, res: Response) {
        const { archivoid, seccionid } = req.params;
        const { usuarioAuth, archivo } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const deleteResult = await FileUploadService.delete(archivo.archivo);

            if (!deleteResult.correct) {
                return res.status(400).json({message: 'Error al eliminar el archivo'});
            }

            await dataSource.getRepository(ArchivosSeccion).delete({
                id: Number(archivoid),
                seccion: { 
                    id: Number(seccionid),
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                },
            });

            res.json({message: 'Archivo eliminado de la seccion correctamente'});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error al eliminar el archivo de la seccion '});
        }
    }

    public async obtenerSeccionesUsuario(req: Request, res: Response) {
        const { usuarioid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const secciones = await dataSource.getRepository(Seccion).find({
                where: {
                    usuario: { id: Number(usuarioid) }
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

}