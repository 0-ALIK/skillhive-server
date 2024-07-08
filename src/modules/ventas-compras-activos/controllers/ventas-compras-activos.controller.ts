import { Request, Response } from "express";
import { DataSource, Like } from "typeorm";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Activo } from "../../../entity/activos/activos";
import { Publicacion } from "../../../entity/publicaciones/publicacion.entity";
import { TipoPublicacionEnum } from "../../../entity/publicaciones/tipo_publicacion.entity";
import { FileUploadService } from "../../../services/file-upload";
import { UploadedFile } from "express-fileupload";
import { ActivoArchivos } from "../../../entity/activos/activos_archivos";

export class VentasComprasActivosController {

    public async obtenerActivos(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { 
            page = 1,
            limit = 20,
            search,
            subcategoria,
            usuario,
            valoracion_orden,
            fecha_orden = ''
        } = req.query;

        const where: any = {
            enRevision: false,
            aprobado: true,
            publicacion: {
                publicado: true,
                subcategorias: {},
                usuario: {}
            }
        };

        if (search) {
            where.publicacion.titulo = Like(`%${search}%`);
        }

        if (subcategoria) {
            where.publicacion.subcategorias.id = Number(subcategoria);
        }

        if (usuario) {
            where.publicacion.usuario.id = Number(usuario);
        }

        try {

            const activosTodos = await dataSource.getRepository(Activo).find({
                relations: {
                    publicacion: {
                        subcategorias: true,
                        usuario: true,
                        likes: true
                    }
                },
                where: where,
                order: { createdAt: fecha_orden === 'ASC' ? 'ASC' : 'DESC' },
            });

            const activosLikesContados = activosTodos.map(activo => {
                return {
                    ...activo,
                    likes_count: activo.publicacion.likes.length
                }
            });

            const activosOrdenados = activosLikesContados.sort((a, b) => {
                if (valoracion_orden === 'ASC') {
                    return a.likes_count - b.likes_count;
                } else if (valoracion_orden === 'DESC') {
                    return b.likes_count - a.likes_count;
                } else {
                    return 0;
                }
            });

            const activos = activosOrdenados.slice((Number(page) - 1) * Number(limit), Number(limit));

            const total = activosOrdenados.length;

            res.json({ activos, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los activos' });
        }
        
    }

    public async obtenerActivoById(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { activoid } = req.params;

        try {
            const activo = await dataSource.getRepository(Activo).findOne({
                where: {
                    id: Number(activoid),
                    enRevision: false,
                    aprobado: true,
                    publicacion: { publicado: true }
                },
                relations: {
                    publicacion: {
                        subcategorias: true,
                        usuario: true,
                        likes: true
                    }
                }
            });

            if (!activo) {
                return res.status(404).json({ message: 'Activo no encontrado' });
            }

            res.json(activo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el activo' });
        }
    }

    public async crearActivo(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { 
            portada,
            recursos = [],
            usuarioAuth,
            titulo,
            descripcion_corta,
            precio,
            subcategoriasIds,
        } = req.body;

        try {
            
            const uploadResult = await FileUploadService.upload(portada);

            if (!uploadResult.correct) {
                return res.status(500).json({ message: 'Error al subir la portada' });
            }
            
            await dataSource.transaction(async transaction => { try {

                const publicacion = Publicacion.create({
                    titulo,
                    descripcion_corta,
                    portada: uploadResult.url,
                    usuario: {
                        id: usuarioAuth.id_usuario
                    },
                    subcategorias: subcategoriasIds?.map((id: number) => ({ id })),
                    tipo: {
                        id: TipoPublicacionEnum.ACTIVO
                    }
                });

                const publicacionSaved = await transaction.save(publicacion);

                const activo = Activo.create({
                    publicacion: {
                        id: publicacionSaved.id
                    },
                    precio,
                });

                const activoSaved = await transaction.save(activo);

                const recursosUploadPromises = recursos.map(async (recurso: UploadedFile) => {
                    const uploadRecurso = await FileUploadService.upload(recurso);

                    if (!uploadRecurso.correct) {
                        throw new Error('Error al subir un recurso');
                    }

                    const activoArchivo = ActivoArchivos.create({
                        archivo: uploadRecurso.url,
                        activo: { id: activoSaved.id }
                    });

                    await transaction.save(activoArchivo);
                });

                await Promise.all(recursosUploadPromises);

                
            } catch (transactionError) {
                console.error(transactionError);
                throw transactionError;
            }});

            res.json({ message: 'Activo creado' });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el activo' });
        }
    }

    public async editarActivo(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { activoid } = req.params;
        const { 
            portada,
            recursos = [],
            recursosElimiarIds = [],
            titulo,
            descripcion_corta,
            precio
        } = req.body;

        try {

            const activo = await dataSource.getRepository(Activo).findOne({
                where: {
                    id: Number(activoid)
                },
                relations: {
                    publicacion: true,
                    archivos: true
                }
            });

            if (!activo) {
                return res.status(404).json({ message: 'Activo no encontrado' });
            }

            const recursosActivoIds = activo.archivos.map(archivo => archivo.id);
            const recursosEliminarIdsNoEncontrados = recursosElimiarIds.filter((id: number) => !recursosActivoIds.includes(id));
            if (recursosEliminarIdsNoEncontrados.length > 0) {
                return res.status(400).json({ message: 'No se encontraron los recursos a eliminar con los ids: '+recursosEliminarIdsNoEncontrados.join(', ') });
            }

            let uploadResult = null;

            if(portada) {
                const oldPortadaUrl = activo.publicacion.portada;
                const uploadResultDelete = await FileUploadService.delete(oldPortadaUrl);

                if (!uploadResultDelete.correct) {
                    return res.status(500).json({ message: 'Error al eliminar la portada actual' });
                }

                uploadResult = await FileUploadService.upload(portada);

                if (!uploadResult.correct) {
                    return res.status(500).json({ message: 'Error al subir la portada' });
                }
            }

            await dataSource.transaction(async transaction => { try {

                await transaction.update(Publicacion, activo.publicacion.id, {
                    titulo: titulo || activo.publicacion.titulo,
                    descripcion_corta: descripcion_corta || activo.publicacion.descripcion_corta,
                    portada: uploadResult ? uploadResult.url : activo.publicacion.portada
                });

                await transaction.update(Activo, activo.id, {
                    precio: precio || activo.precio
                });

                const recursosUploadPromises = recursos.map(async (recurso: UploadedFile) => {
                    const uploadRecurso = await FileUploadService.upload(recurso);

                    if (!uploadRecurso.correct) {
                        throw new Error('Error al subir un recurso');
                    }

                    const activoArchivo = ActivoArchivos.create({
                        archivo: uploadRecurso.url,
                        activo: { id: activo.id }
                    });

                    await transaction.save(activoArchivo);
                });

                await Promise.all(recursosUploadPromises);

                const recursosEliminarPromises = recursosElimiarIds.map(async (id: number) => {
                    const archivo = activo.archivos.find(archivo => archivo.id === id);
                    
                    if (!archivo) {
                        throw new Error('No se encontró el archivo a eliminar');
                    }

                    const uploadRecursoDelete = await FileUploadService.delete(archivo?.archivo);

                    if (!uploadRecursoDelete.correct) {
                        throw new Error('Error al eliminar un recurso');
                    }

                    await transaction.delete(ActivoArchivos, id);
                });

                await Promise.all(recursosEliminarPromises);

            } catch (transactionError) {
                console.error(transactionError);
                throw transactionError;
            }});

            res.json({ message: 'Activo editado' });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al editar el activo' });   
        }
    }

    public async revisionSwitch(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { activoid, action } = req.params;

        try {
            const activoUpdated = await dataSource.getRepository(Activo).update(Number(activoid), {
                enRevision: action === 'enviar'
            });

            if (activoUpdated.affected === 0) {
                return res.status(404).json({ message: 'No se encontró el activo' });
            }

            res.json({ message: 'Revisión cambiada' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al cambiar el estado de revisión' });
        }
    }

    public async obtenerActivosPropios(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { 
            page = 1,
            limit = 20,
            publicado = 0,
            en_revision = 0,
        } = req.query;
        const { usuarioAuth } = req.body;

        const where: any = {
            publicacion: {
                usuario: {
                    id: Number(usuarioAuth.id_usuario)
                }
            },
        };

        if (publicado) {
            where.publicacion.publicado = true;
        }

        if (en_revision) {
            where.enRevision = true;
        }

        try {
            const activos = await dataSource.getRepository(Activo).find({                
                take: Number(limit),
                skip: (Number(page) - 1) * Number(limit),
                relations: {
                    publicacion: {
                        subcategorias: true,
                        usuario: true
                    }
                },
                where
            });

            res.json(activos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los activos' });
        }
    }

    public async obtenerActivoPropioById(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { activoid } = req.params;
        const { usuarioAuth } = req.body;

        try {
            const activo = await dataSource.getRepository(Activo).findOne({
                where: {
                    id: Number(activoid),
                    publicacion: {
                        usuario: { id: Number(usuarioAuth.id_usuario) }
                    }
                },
                relations: {
                    publicacion: {
                        subcategorias: true,
                        usuario: true
                    },
                    archivos: true
                }
            });

            if (!activo) {
                return res.status(404).json({ message: 'Activo no encontrado' });
            }

            res.json(activo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener el activo' });
        }
    }
    
}
