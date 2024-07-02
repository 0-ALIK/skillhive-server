import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { FileUploadService } from '../../../services/file-upload';
import { Comision } from '../../../entity/comisiones/comision.entity';
import { ComisionImagenesEjemplo } from '../../../entity/comisiones/comision_imagenes_ejemplo.entity';
import { UploadedFile } from 'express-fileupload';
import { Like } from 'typeorm';
import { Usuario } from '../../../entity/usuarios/usuario.entity';
import { ComisionSolicitud } from '../../../entity/comisiones/comision_solicitud.entity';
import { ComisionSolicitudEstado, ComisionSolicitudEstadoEnum } from '../../../entity/comisiones/comision_solicitud_estado.entity';
import { ComisionSolicitudEntregables } from '../../../entity/comisiones/comision_solicitud_entregables.entity';

export class ComisionesController {

    public async obtenerEstados(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;

        try {
            const estados = await dataSource.getRepository(ComisionSolicitudEstado).find();

            res.status(200).json({ estados });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los estados' });
        }
    }

    public async obtenerComisiones(req: Request, res: Response) {
        const {
            page = 1,
            limit = 20,
            search,
            usuario,
            subcategoria,
        } = req.query;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const where: any = {
                usuario: {},
                subcategorias: {}
            }

            if (search) {
                where.titulo = Like(`%${search}%`);
            }

            if (usuario) {
                where.usuario = { id: usuario };
            }

            if (subcategoria) {
                where.subcategorias = { id: subcategoria };
            }
            
            const [comisiones, cantidad] = await dataSource.getRepository(Comision).findAndCount({
                take: Number(limit),
                skip: (Number(page) - 1) * Number(limit),
                where,
                relations: {
                    usuario: true,
                }
            });

            res.status(200).json({ comisiones, cantidad });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las comisiones' });
        }
    }

    public async obtenerComisionById(req: Request, res: Response) {
        const { comisionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const comision = await dataSource.getRepository(Comision).findOne({
                where: { id: Number(comisionid) },
                relations: { 
                    imagenes: true,
                    usuario: true,
                    subcategorias: true
                }
            });

            res.status(200).json({ comision });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la comisión' });
        }
    }

    public async crearComision(req: Request, res: Response) {
        const {
            imagen,
            imagenes_ejemplo,
            titulo,
            descripcion,
            precio,
            subcategoriasIds,
            usuarioAuth
        } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {

            const uploadResult = await FileUploadService.upload(imagen);

            if (!uploadResult.correct) {
                return res.status(400).json({ message: 'Error al subir la imagen de portada' });
            }

            await dataSource.transaction(async transaction => { try {

                const comision = Comision.create({
                    usuario: { id: Number(usuarioAuth.id_usuario) },
                    imagen: uploadResult.url,
                    precio: Number(precio),
                    titulo,
                    descripcion,
                    subcategorias: subcategoriasIds?.map((id: number) => ({ id }))
                });

                const comisionSaved = await transaction.save(comision);

                const imagenesPromises = imagenes_ejemplo.map(async (imagen: UploadedFile) => {
                    const uploadResult = await FileUploadService.upload(imagen);
                    if (!uploadResult.correct) {
                        throw new Error('Error al subir una imagen de ejemplo');
                    }

                    const imagenEjemplo = ComisionImagenesEjemplo.create({
                        comision: { id: comisionSaved.id },
                        imagen: uploadResult.url
                    });

                    await transaction.save(imagenEjemplo);
                });

                await Promise.all(imagenesPromises);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al crear la comisión' });
            }});

            res.status(201).json({ message: 'Comisión creada correctamente' });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la comisión' });
        }
    }

    public async actualizarComision(req: Request, res: Response) {
        const {
            imagen,
            imagenes_ejemplo,
            titulo,
            descripcion,
            precio,
            subcategoriasIds = [],
            imagenesEliminarIds = [],
            usuarioAuth
        } = req.body;
        const { comisionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            
            const comision = await dataSource.getRepository(Comision).findOne({
                where: {
                    id: Number(comisionid),
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                },
                relations: { imagenes: true }
            });

            if (!comision) {
                return res.status(400).json({ message: 'La comisión no pertenece al usuario' });
            }

            const imagenesIds = comision.imagenes.map(imagen => imagen.id);
            const imagenesEliminarIdsNoEncontrados = imagenesEliminarIds.filter((id: number) => !imagenesIds.includes(id));
            if (imagenesEliminarIdsNoEncontrados.length > 0) {
                return res.status(400).json({ message: 'No se encontraron las imágenes a eliminar' });
            }

            let uploadResult = null;

            if (imagen) {
                const oldImagen = comision.imagen;
                const uploadResultDelete = await FileUploadService.delete(oldImagen);

                if (!uploadResultDelete.correct) {
                    return res.status(400).json({ message: 'Error al eliminar la imagen de portada' });
                }

                uploadResult = await FileUploadService.upload(imagen);

                if (!uploadResult.correct) {
                    return res.status(400).json({ message: 'Error al subir la imagen de portada' });
                }
            }

            await dataSource.transaction(async transaction => { try {

                await transaction.update(Comision, comision.id, {
                    imagen: uploadResult ? uploadResult.url : comision.imagen,
                    precio: Number(precio) || comision.precio,
                    titulo: titulo || comision.titulo,
                    descripcion: descripcion || comision.descripcion,
                    subcategorias: subcategoriasIds?.map((id: number) => ({ id }))
                });

                const imagenesPromises = imagenes_ejemplo.map(async (imagen: UploadedFile) => {
                    const uploadResult = await FileUploadService.upload(imagen);
                    if (!uploadResult.correct) {
                        throw new Error('Error al subir una imagen de ejemplo');
                    }

                    const imagenEjemplo = ComisionImagenesEjemplo.create({
                        comision: { id: comision.id },
                        imagen: uploadResult.url
                    });

                    await transaction.save(imagenEjemplo);
                });

                await Promise.all(imagenesPromises);

                const imagenesEliminarPromises = imagenesEliminarIds.map(async (id: number) => {
                    const imagen = comision.imagenes.find(imagen => imagen.id === id);

                    if (!imagen) {
                        throw new Error('Error al eliminar una imagen de ejemplo');
                    }

                    const uploadResultDelete = await FileUploadService.delete(imagen.imagen);

                    if (!uploadResultDelete.correct) {
                        throw new Error('Error al eliminar una imagen de ejemplo');
                    }

                    await transaction.delete(ComisionImagenesEjemplo, id);
                });

                await Promise.all(imagenesEliminarPromises);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al actualizar la comisión' });
            }});

            res.status(200).json({ message: 'Comisión actualizada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la comisión '});
        }
    }

    public async openComisionSwitch(req: Request, res: Response) {
        const { action } = req.params;
        const { usuarioAuth } = req.body;  
        const dataSource = DatabaseConnectionService.connection;

        try {
        

            await dataSource.getRepository(Usuario).update(usuarioAuth.id_usuario, {
                freelancer: {
                    open_comissions: action === 'on' ? true : false
                }
            });

            res.status(200).json({ message: 'Comisión actualizada correctamente' });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar la comisión' });
        }
    }

    public async obtenerSolictudesComisionesRecibidas(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const { estadoid, comisionid } = req.query;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const where: any = {
                comision: {
                    usuario: { id: (usuarioAuth.id_usuario) }
                },
                estado: {}
            }

            if (estadoid) {
                where.estado = { id: Number(estadoid) };
            }

            if (comisionid) {
                where.comision = { id: Number(comisionid) };
            }

            const solicitudesRecibidas = await dataSource.getRepository(ComisionSolicitud).find({
                where,
                relations: {
                    usuario: true,
                    estado: true,
                    comision: true
                }
            });

            res.status(200).json({ solicitudesRecibidas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las solicitudes de comisiones' });
        }
    }

    public async obtenerSolictudComisionRecibida(req: Request, res: Response) {
        const { solicitudid } = req.params;
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const solicitud = await dataSource.getRepository(ComisionSolicitud).findOne({
                where: { 
                    id: Number(solicitudid),
                    comision: {
                        usuario: { id: Number(usuarioAuth.id_usuario) }
                    }
                },
                relations: {
                    usuario: true,
                    estado: true,
                    comision: {
                        imagenes: true,
                        subcategorias: true
                    },
                    entregables: true
                }
            });

            res.status(200).json({ solicitud });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener la solicitud de comisión' });
        }
    }

    public async recibirSolicitudComision(req: Request, res: Response) {
        const { solicitudid, action } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {

            await dataSource.getRepository(ComisionSolicitud).update(solicitudid, {
                estado: { 
                    id: action === 'aceptar' 
                        ? ComisionSolicitudEstadoEnum.ACEPTADA
                        : ComisionSolicitudEstadoEnum.RECHAZADA
                }
            });

            res.status(200).json({ message: 'Solicitud de comisión controlada' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al recibir la solicitud de comisión' });
        }
    }

    public async cancelarComision(req: Request, res: Response) {
        const { solicitudid } = req.params;
        const dataSource = DatabaseConnectionService.connection;
        try {

            await dataSource.getRepository(ComisionSolicitud).update(solicitudid, {
                estado: { id: ComisionSolicitudEstadoEnum.CANCELADA }
            });

            res.status(200).json({ message: 'Comisión cancelada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al cancelar la comisión '});
        }
    }

    public async entregarComision(req: Request, res: Response) {
        const { entregables } = req.body;
        const { solicitudid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            await dataSource.transaction(async transaction => { try {

                await transaction.update(ComisionSolicitud, solicitudid, {
                    estado: { id: ComisionSolicitudEstadoEnum.ENTREGADA }
                });

                const entregablesPromises = entregables.map(async (entregable: UploadedFile) => {
                    const uploadResult = await FileUploadService.upload(entregable);
                    if (!uploadResult.correct) {
                        throw new Error('Error al subir un entregable');
                    }

                    const entregableEntity = ComisionSolicitudEntregables.create({
                        solicitud: { id: Number(solicitudid) },
                        archivo: uploadResult.url
                    });

                    await transaction.save(entregableEntity);
                });

                await Promise.all(entregablesPromises);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error al entregar la comisión' });
            }});

            res.status(200).json({ message: 'Comisión entregada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al entregar la comisión' });
        }
    }
    
}