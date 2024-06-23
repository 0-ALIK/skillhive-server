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
            subespecialidad,
            usuario
        } = req.query;

        const where: any = {
            publicacion: {
                subcategorias: {},
                subespecialidades: {},
                usuario: {}
            }
        };

        if (search) {
            where.publicacion.titulo = Like(`%${search}%`);
        }

        if (subcategoria) {
            where.publicacion.subcategorias.id = Number(subcategoria);
        }

        if (subespecialidad) {
            where.publicacion.subespecialidades.id = Number(subespecialidad);
        }

        if (usuario) {
            where.publicacion.usuario.id = Number(usuario);
        }

        try {
            const activos = await dataSource.getRepository(Activo).find({                
                take: Number(limit),
                skip: (Number(page) - 1) * Number(limit),
                relations: {
                    publicacion: {
                        subcategorias: true,
                        subespecialidades: true,
                        usuario: true
                    }
                },
                where: where
            });

            res.json(activos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los activos' });
        }
        
    }

    public async obtenerActivoById(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { id } = req.params;

        try {
            const activo = await dataSource.getRepository(Activo).findOne({
                where: {
                    id: Number(id)
                },
                relations: {
                    publicacion: {
                        subcategorias: true,
                        subespecialidades: true,
                        usuario: true
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
            subespecialidadesIds
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
                    subespecialidades: subespecialidadesIds?.map((id: number) => ({ id })),
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
        const { id } = req.params;
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
                    id: Number(id)
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
    
}
