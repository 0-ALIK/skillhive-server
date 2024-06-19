import { Request, Response } from "express";
import { DataSource, Like } from "typeorm";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Activo } from "../../../entity/activos/activos";
import { Publicacion } from "../../../entity/publicaciones/publicacion.entity";

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
            usuarioAuth,
            titulo,
            descripcion_corta,
            precio,
            subcategoriasIds,
            subespecialidadesIds
        } = req.body;

        try {

            await dataSource.transaction(async transaction => {

                const publicacion = Publicacion.create({
                    titulo,
                    descripcion_corta,
                    usuario: {
                        id: usuarioAuth.id_usuario
                    },
                    subcategorias: subcategoriasIds?.map((id: number) => ({ id })),
                    subespecialidades: subespecialidadesIds?.map((id: number) => ({ id }))
                });

                const publicacionSaved = await transaction.save(publicacion);

                const activo = Activo.create({
                    publicacion: {
                        id: publicacionSaved.id
                    },
                    precio,
                });

                await transaction.save(activo);

            });

            res.json({ message: 'Activo creado' });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el activo' });
        }
    }
    
}