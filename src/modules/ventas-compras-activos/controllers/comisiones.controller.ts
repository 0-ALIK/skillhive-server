import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { FileUploadService } from '../../../services/file-upload';
import { Comision } from '../../../entity/comisiones/comision.entity';
import { ComisionImagenesEjemplo } from '../../../entity/comisiones/comision_imagenes_ejemplo.entity';
import { UploadedFile } from 'express-fileupload';

export class ComisionesController {

    public async obtenerComisiones(req: Request, res: Response) {}

    public async obtenerComisionById(req: Request, res: Response) {}

    public async openComisionSwitch(req: Request, res: Response) {}

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
    
}