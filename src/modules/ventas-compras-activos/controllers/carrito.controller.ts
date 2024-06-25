import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Carrito } from '../../../entity/activos/carrito';

export class CarritoController {

    public async obtenerCarrito(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {

            const carrito = await dataSource.getRepository(Carrito).find({
                where: {
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    }
                },
                relations: {
                    activo: true
                }
            });

            res.status(200).json(carrito);
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al obtener el carrito' });
        }
    }

    public async agregarActivo(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const { activoid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {

            const carritoItem = Carrito.create({
                usuario: {
                    id: Number(usuarioAuth.id_usuario)
                },
                activo: {
                    id: Number(activoid)
                }
            });

            await dataSource.getRepository(Carrito).save(carritoItem);

            res.status(200).json({ message: 'Activo agregado al carrito' });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al agregar el activo al carrito' });
        }        
    }

    public async eliminarActivo(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const { activoid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {

            await dataSource.getRepository(Carrito).delete({
                usuario: {
                    id: Number(usuarioAuth.id_usuario)
                },
                activo: {
                    id: Number(activoid)
                }
            });

            res.status(200).json({ message: 'Activo eliminado del carrito' });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al eliminar el activo del carrito' });
        }

    }

}