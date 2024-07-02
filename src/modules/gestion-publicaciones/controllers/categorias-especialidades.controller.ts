import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Categoria } from '../../../entity/categorias/categoria.entity';
import { Subcategoria } from '../../../entity/categorias/subcategoria.entity';
import { Especialidad } from '../../../entity/especialidades/especialidad.entity';
import { Subespecialidad } from '../../../entity/especialidades/subespecialidad.entity';

export class CategoriasEspecialidadesController {

    public async obtenerCategorias(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;
        try {
            const categorias = await dataSource.getRepository(Categoria).find();
            res.status(200).json(categorias);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las categorias' });
        }
    }

    public async obtenerSubcategorias(req: Request, res: Response) {
        const { catid } = req.query;
        const dataSource = DatabaseConnectionService.connection;
        try {
            const where: any = {
                categoria: {}
            }

            if (catid) {
                where.categoria = { id: Number(catid) };
            }

            const subcategorias = await dataSource.getRepository(Subcategoria).find({
                where
            });

            res.status(200).json(subcategorias);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las subcategorias' });
        }
    }

    public async obtenerEspecialidades(req: Request, res: Response) {
        const dataSource = DatabaseConnectionService.connection;
        try {
            const especialidades = await dataSource.getRepository(Especialidad).find();
            res.status(200).json(especialidades);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las especialidades' });
        }
    }

    public async obtenerSubespecialidades(req: Request, res: Response) {
        const { espid } = req.query;
        const dataSource = DatabaseConnectionService.connection;
        try {
            const where: any = {
                especialidad: {}
            }

            if (espid) {
                where.especialidad = { id: Number(espid) };
            }

            const subespecialidades = await dataSource.getRepository(Subespecialidad).find({
                where
            });

            res.status(200).json(subespecialidades);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener las subespecialidades' });
        }
    }

}