import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Publicacion } from '../../../entity/publicaciones/publicacion.entity';
import { TipoPublicacion, TipoPublicacionEnum } from '../../../entity/publicaciones/tipo_publicacion.entity';
import { Like } from 'typeorm';
import { FileUploadService } from '../../../services/file-upload';
import { Articulo } from '../../../entity/publicaciones/articulo.entity';
import { Archivo } from '../../../entity/publicaciones/archivo.entity';

export class PublicacionController {

    public async obtenerTiposPublicacion(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;

        try {
            const tiposPublicacion = await dataSource.getRepository(TipoPublicacion).find();
            res.status(200).json(tiposPublicacion);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los tipos de publicación' });
        }
    }

    public async obtenerPublicaciones(req: Request, res: Response) {
        const {
            page = 1,
            limit = 10,
            search = '',
            usuario = 0,
            subcategoria = 0,
            valoracion_orden = 'DESC',
            fecha_orden = 'DESC'
        } = req.query;
        const dataSource = DatabaseConnectionService.connection;

        const where: any = {
            publicado: true,
            subcategorias: {},
            usuario: {},
        }

        if (usuario) {
            where.usuario.id = Number(usuario);
        }

        if (subcategoria) {
            where.subcategorias.id = Number(subcategoria);
        }

        if (search) {
            where.titulo = Like(`%${search}%`);
        }

        try {
            const publicaionesTodas = await dataSource.getRepository(Publicacion).find({
                relations: {
                    subcategorias: true,
                    usuario: true,
                    likes: true
                },
                where,
                order: {
                    createdAt: fecha_orden === 'ASC' ? 'ASC' : 'DESC'
                }
            });

            const publicacionesLikesContados = publicaionesTodas.map(publicacion => {
                return {
                    ...publicacion,
                    likes_count: publicacion.likes.length
                };
            });

            const publicacionesOrdenadas = publicacionesLikesContados.sort((a, b) => {
                if (valoracion_orden === 'ASC') {
                    return a.likes_count - b.likes_count;
                } else {
                    return b.likes_count - a.likes_count;
                }
            });

            const publicaciones = publicacionesOrdenadas.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

            const total = publicacionesOrdenadas.length;

            res.status(200).json({ publicaciones, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las publicaciones' });
        }
    }

    public async obtenerPublicacionesPropias(req: Request, res: Response) {
        const {
            page = 1,
            limit = 10,
            search = '',
            publicado = true
        } = req.query;
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        const where: any = {
            usuario: {
                id: Number(usuarioAuth.id_usuario)
            },
            publicado: publicado
        }

        if (search) {
            where.titulo = Like(`%${search}%`);
        }

        try {
            const [publicaiones, total] = await dataSource.getRepository(Publicacion).findAndCount({
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
                where,
                order: {
                    createdAt: 'DESC'
                },
                relations: {
                    subcategorias: true,
                    usuario: true
                }
            });

            res.status(200).json({ publicaiones, total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las publicaciones' });
        }
    }

    public async obtenerPublicacion(req: Request, res: Response) {
        const { publicacionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(publicacionid)
                },
                relations: {
                    subcategorias: true,
                    usuario: true,
                    likes: true,
                    comentarios: {
                        usuario: true
                    }
                }
            });

            if (!publicacion) {
                return res.status(404).json({ message: 'No se encontró la publicación' });
            }

            res.status(200).json(publicacion);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la publicación' });
        }
    }

    public async agregarSubcategoria(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;
        const { subcategoriasIds = [] } = req.body;
        const { publicacionid } = req.params;

        try {

            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(publicacionid)
                },
                relations: {
                    subcategorias: true
                }
            });

            if (!publicacion) {
                return res.status(404).json({ message: 'No se encontró la publicación' });
            }

            const subcategoriasRepetidas = publicacion.subcategorias.filter(subcategoria => subcategoriasIds.includes(subcategoria.id) );
            
            if (subcategoriasRepetidas.length > 0) {
                return res.status(400).json({ message: 'La publicación ya tiene una o más subcategorias agregadas' });
            }

            const queryRunner = dataSource.createQueryRunner();   
            await queryRunner.connect();

            let values = '';

            subcategoriasIds.forEach((subcategoriaId: number, index: number) => {
                values += `(${publicacionid}, ${subcategoriaId})`;
                if (index < subcategoriasIds.length - 1) {
                    values += ', ';
                }
            });

            console.log(values);

            await queryRunner.query('INSERT INTO publicacion_subcategoria (publicacionId, subcategoriaId) VALUES '+values);

            await queryRunner.release();

            res.status(200).json({ message: 'Subcategorias agregadas correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al agregar las subcategorias' });
        }
    }

    public async eliminarSubcategoria(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;
        const { publicacionid, subcatid } = req.params;

        try {

            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(publicacionid)
                },
                relations: {
                    subcategorias: true
                }
            });

            if (!publicacion) {
                return res.status(404).json({ message: 'No se encontró la publicación' });
            }

            const subcategoria = publicacion.subcategorias.find(subcategoria => subcategoria.id === Number(subcatid) );
            
            if (!subcategoria) {
                return res.status(400).json({ message: 'La publicación no tiene la subcategoria que se desea eliminar' });
            }

            const queryRunner = dataSource.createQueryRunner();   
            await queryRunner.connect();

            await queryRunner.query('DELETE FROM publicacion_subcategoria WHERE publicacionId = ? AND subcategoriaId = ?', [publicacionid, subcatid]);

            await queryRunner.release();

            res.status(200).json({ message: 'Subcategoria eliminada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la subcategoria' });
        }
    }

    public async publicarSwitch(req: Request, res: Response) {
        const { publicacionid, action } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: { id: Number(publicacionid) },
                relations: { tipo: true, activo: true }
            });

            if (!publicacion) {
                return res.status(404).json({ message: 'No se encontró la publicación' });
            }

            if (publicacion.tipo.id === TipoPublicacionEnum.ACTIVO) {
                if(!publicacion.activo.aprobado) {
                    return res.status(400).json({ message: 'El activo no ha sido aprobado por el administrador' });
                }
            }

            const publicacionUpdated = await dataSource.getRepository(Publicacion).update(Number(publicacionid), {
                publicado: action === 'on'
            });

            if (publicacionUpdated.affected === 0) {
                return res.status(404).json({ message: 'No se encontró la publicación' });
            }

            res.status(200).json({ message: 'Estado de publicación cambiado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al cambiar el estado de publicación' });
        }
    }

    public async crearPublicacionArticulo(req: Request, res: Response) {
        const {titulo, descripcion_corta, portada, contenido, subcategoriasIds, usuarioAuth} = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            await dataSource.transaction(async transaction => { try {
                
                const uploadResult = await FileUploadService.upload(portada);

                if(!uploadResult.correct) {
                    throw new Error('Error al subir la imagen de portada');
                }

                const publicacion = Publicacion.create({
                    titulo,
                    descripcion_corta,
                    portada: uploadResult.url,
                    usuario: { id: Number(usuarioAuth.id_usuario) },
                    subcategorias: subcategoriasIds.map((subcategoriaId: number) => ({ id: subcategoriaId })),
                    tipo: { id: TipoPublicacionEnum.ARTICULO }
                });

                const publicacionSaved = await transaction.save(publicacion);

                const articulo = Articulo.create({
                    contenido,
                    publicacion: { id: publicacionSaved.id }
                });

                await transaction.save(articulo);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al crear la publicación - tran' });   
            }})

            res.status(200).json({ message: 'Publicación creada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la publicación' });
        }
    }

    public async editarPublicacionArticulo(req: Request, res: Response) {
        const {titulo, descripcion_corta, portada, contenido, usuarioAuth} = req.body;
        const { publicacionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            await dataSource.transaction(async transaction => { try {

                const publicacion = await transaction.getRepository(Publicacion).findOne({
                    where: {
                        id: Number(publicacionid),
                        usuario: { id: Number(usuarioAuth.id_usuario) }
                    },
                    relations: { articulo: true }
                });

                if (!publicacion) {
                    throw new Error('No se encontró la publicación');
                }

                let portadaUrl = null;
                if (portada) {
                    const deleteResult = await FileUploadService.delete(publicacion.portada);
                    if (!deleteResult.correct) {
                        throw new Error('Error al eliminar la imagen de portada');
                    }

                    const uploadResult = await FileUploadService.upload(portada);

                    if(!uploadResult.correct) {
                        throw new Error('Error al subir la imagen de portada');
                    }

                    portadaUrl = uploadResult.url;
                }

                await transaction.getRepository(Publicacion).update(Number(publicacionid), {
                    titulo: titulo || publicacion.titulo,
                    descripcion_corta: descripcion_corta || publicacion.descripcion_corta,
                    portada: portadaUrl || publicacion.portada
                });

                await transaction.getRepository(Articulo).update(publicacion.articulo.id, {
                    contenido: contenido || publicacion.articulo.contenido
                });

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al editar la publicación - tran'});
            }});

            res.status(200).json({ message: 'Publicación editada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al editar la publicación' });
        }
    }

    public async eliminarPublicacionArticulo(req: Request, res: Response) {
        const { publicacionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            await dataSource.transaction(async transaction => { try {

                const publicacion = await transaction.getRepository(Publicacion).findOne({
                    where: {
                        id: Number(publicacionid)
                    },
                    relations: { articulo: true }
                });

                if (!publicacion) {
                    throw new Error('No se encontró la publicación');
                }

                const deleteResult = await FileUploadService.delete(publicacion.portada);

                if (!deleteResult.correct) {
                    throw new Error('Error al eliminar la imagen de portada');
                }

                await transaction.getRepository(Articulo).delete(publicacion.articulo.id);

                await transaction.getRepository(Publicacion).delete(publicacionid);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al eliminar la publicación - tran'});
            }});

            res.status(200).json({ message: 'Publicación eliminada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la publicación' });
        }
    }

    public async crearPublicacionArchivos(req: Request, res: Response) {

        const {titulo, descripcion_corta, portada, archivos, subcategoriasIds, usuarioAuth} = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            await dataSource.transaction(async transaction => { try {
                
                const uploadResult = await FileUploadService.upload(portada);

                if(!uploadResult.correct) {
                    throw new Error('Error al subir la imagen de portada');
                }

                const publicacion = Publicacion.create({
                    titulo,
                    descripcion_corta,
                    portada: uploadResult.url,
                    usuario: { id: Number(usuarioAuth.id_usuario) },
                    subcategorias: subcategoriasIds.map((subcategoriaId: number) => ({ id: subcategoriaId })),
                    tipo: { id: TipoPublicacionEnum.MULTIMEDIOS }
                });

                const publicacionSaved = await transaction.save(publicacion);

                const uploadArchivosPromise = archivos.map(async (archivo: any) => {
                    const uploadResult = await FileUploadService.upload(archivo);

                    if(!uploadResult.correct) {
                        throw new Error('Error al subir el archivo');
                    }

                    const archivoEntity = Archivo.create({
                        archivo: uploadResult.url,
                        publicacion: { id: publicacionSaved.id }
                    });

                    await transaction.save(archivoEntity);
                });

                await Promise.all(uploadArchivosPromise);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al crear la publicación - tran' });   
            }})

            res.status(200).json({ message: 'Publicación creada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la publicación' });
        }
    }

    public async editarPublicacionArchivos(req: Request, res: Response) {
        const {titulo, descripcion_corta, portada, archivos, usuarioAuth, archivosIdsEliminar = []} = req.body;
        const { publicacionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            
            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(publicacionid),
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                },
                relations: { archivos: true }
            });

            if (!publicacion) {
                return res.status(404).json({ message: 'No se encontró la publicación' });
            }

            const archivosPublicacionIds = publicacion.archivos.map(archivo => archivo.id);
            const archivosEliminarIdsNoEncontrados = archivosIdsEliminar.filter((id: number) => !archivosPublicacionIds.includes(id));
            if (archivosEliminarIdsNoEncontrados.length > 0) {
                return res.status(400).json({ message: 'No se encontraron los archivos a eliminar' });
            }

            await dataSource.transaction(async transaction => { try {

                let portadaUrl = null;
                if (portada) {
                    const deleteResult = await FileUploadService.delete(publicacion.portada);
                    if (!deleteResult.correct) {
                        throw new Error('Error al eliminar la imagen de portada');
                    }

                    const uploadResult = await FileUploadService.upload(portada);

                    if(!uploadResult.correct) {
                        throw new Error('Error al subir la imagen de portada');
                    }

                    portadaUrl = uploadResult.url;
                }

                await transaction.getRepository(Publicacion).update(Number(publicacionid), {
                    titulo: titulo || publicacion.titulo,
                    descripcion_corta: descripcion_corta || publicacion.descripcion_corta,
                    portada: portadaUrl || publicacion.portada
                });

                const uploadArchivosPromise = archivos.map(async (archivo: any) => {
                    const uploadResult = await FileUploadService.upload(archivo);

                    if(!uploadResult.correct) {
                        throw new Error('Error al subir el archivo');
                    }

                    const archivoEntity = Archivo.create({
                        archivo: uploadResult.url,
                        publicacion: { id: publicacion.id }
                    });

                    await transaction.save(archivoEntity);
                });

                await Promise.all(uploadArchivosPromise);

                const deleteArchivosPromise = archivosIdsEliminar.map(async (id: number) => {
                    const archivo = await transaction.getRepository(Archivo).findOneBy({id});

                    if (!archivo) {
                        throw new Error('No se encontró el archivo a eliminar');
                    }

                    const deleteResult = await FileUploadService.delete(archivo.archivo);

                    if (!deleteResult.correct) {
                        throw new Error('Error al eliminar el archivo');
                    }

                    await transaction.getRepository(Archivo).delete(id);
                });

                await Promise.all(deleteArchivosPromise);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al editar la publicación - tran'});
            }});

            res.status(200).json({ message: 'Publicación editada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al editar la publicación'});
        }
    }

    public async eliminarPublicacionArchivos(req: Request, res: Response) {
        const { publicacionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            await dataSource.transaction(async transaction => { try {

                const publicacion = await transaction.getRepository(Publicacion).findOne({
                    where: {
                        id: Number(publicacionid)
                    },
                    relations: { archivos: true }
                });

                if (!publicacion) {
                    throw new Error('No se encontró la publicación');
                }

                const deleteResult = await FileUploadService.delete(publicacion.portada);

                if (!deleteResult.correct) {
                    throw new Error('Error al eliminar la imagen de portada');
                }

                const deleteArchivosPromise = publicacion.archivos.map(async (archivo: Archivo) => {
                    const deleteResult = await FileUploadService.delete(archivo.archivo);

                    if (!deleteResult.correct) {
                        throw new Error('Error al eliminar el archivo');
                    }

                    await transaction.getRepository(Archivo).delete(archivo.id);
                });

                await Promise.all(deleteArchivosPromise);

                await transaction.getRepository(Publicacion).delete(publicacionid);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al eliminar la publicación - tran'});
            }});

            res.status(200).json({ message: 'Publicación eliminada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la publicación' });
        }
    }

}