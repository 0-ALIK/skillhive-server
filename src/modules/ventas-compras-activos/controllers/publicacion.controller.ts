import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Publicacion } from '../../../entity/publicaciones/publicacion.entity';

export class PublicacionController {

    public async agregarSubcategoria(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;
        const { subcategoriasIds = [] } = req.body;
        const { id } = req.params;

        try {

            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(id)
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
                values += `(${id}, ${subcategoriaId})`;
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
        const { subcatid } = req.params;
        const { id } = req.params;

        try {

            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(id)
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

            await queryRunner.query('DELETE FROM publicacion_subcategoria WHERE publicacionId = ? AND subcategoriaId = ?', [id, subcatid]);

            await queryRunner.release();

            res.status(200).json({ message: 'Subcategoria eliminada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la subcategoria' });
        }
    }

    public async agregarSubespecialidad(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;
        const { subespecialidadesIds = [] } = req.body;
        const { id } = req.params;

        try {

            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(id)
                },
                relations: {
                    subespecialidades: true
                }
            });

            if (!publicacion) {
                return res.status(404).json({ message: 'No se encontró la publicación' });
            }

            const subespecialidadesRepetidas = publicacion.subespecialidades.filter(subespecialidad => subespecialidadesIds.includes(subespecialidad.id) );
            
            if (subespecialidadesRepetidas.length > 0) {
                return res.status(400).json({ message: 'La publicación ya tiene una o más subespecialidades agregadas' });
            }

            const queryRunner = dataSource.createQueryRunner();   
            await queryRunner.connect();

            let values = '';

            subespecialidadesIds.forEach((subespecialidadId: number, index: number) => {
                values += `(${id}, ${subespecialidadId})`;
                if (index < subespecialidadesIds.length - 1) {
                    values += ', ';
                }
            });

            await queryRunner.query('INSERT INTO publicacion_subespecialidad (publicacionId, subespecialidadId) VALUES '+values);

            await queryRunner.release();

            res.status(200).json({ message: 'Subespecialidades agregadas correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al agregar las subespecialidades' });
        }
    }

    public async eliminarSubespecialidad(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;
        const { subespid } = req.params;
        const { id } = req.params;

        try {

            const publicacion = await dataSource.getRepository(Publicacion).findOne({
                where: {
                    id: Number(id)
                },
                relations: {
                    subespecialidades: true
                }
            });

            if (!publicacion) {
                return res.status(404).json({ message: 'No se encontró la publicación' });
            }

            const subespecialidad = publicacion.subespecialidades.find(subespecialidad => subespecialidad.id === Number(subespid) );
            
            if (!subespecialidad) {
                return res.status(400).json({ message: 'La publicación no tiene la subespecialidad que se desea eliminar' });
            }

            const queryRunner = dataSource.createQueryRunner();   
            await queryRunner.connect();

            await queryRunner.query('DELETE FROM publicacion_subespecialidad WHERE publicacionId = ? AND subespecialidadId = ?', [id, subespid]);

            await queryRunner.release();

            res.status(200).json({ message: 'Subespecialidad eliminada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar la subespecialidad' });
        }
    }

}