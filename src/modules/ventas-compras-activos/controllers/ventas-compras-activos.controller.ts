import { Request, Response } from "express";
import { DataSource, Like } from "typeorm";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Activo } from "../../../entity/activos/activos";

export class VentasComprasActivosController {

    public async obtenerActivos(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        const { 
            page = 1,
            limit = 20,
            search = '',
            subcategoria = null,
            subespecialidad = null
        } = req.query;

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
                where: {
                    publicacion: {
                        titulo: Like(`%${search}%`),
                        subcategorias: {
                            id: Number(subcategoria)
                        },
                        subespecialidades: {
                            id: Number(subespecialidad)
                        }
                    }
                }
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

    public async crearActivo(req: Request, res: Response) {}
    
}