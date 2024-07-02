import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Publicacion } from '../../../entity/publicaciones/publicacion.entity';
import { TipoPublicacionEnum } from '../../../entity/publicaciones/tipo_publicacion.entity';

export class PublicacionController {

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

}