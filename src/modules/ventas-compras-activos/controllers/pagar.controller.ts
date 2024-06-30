import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Activo } from '../../../entity/activos/activos';
import { PayPalService } from '../../../services/paypal';

export class PagarController {

    public async crearOrdenCompraActivo(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const { activoid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            
            const activo = await dataSource.getRepository(Activo).findOne({
                where: { id: Number(activoid) },
                relations: { publicacion: true}
            });

            if (!activo) {
                return res.status(404).json({ message: 'Activo no encontrado' });
            }

            const orden = await PayPalService.crearOrden([
                {
                    price: activo.precio,
                    description: activo.publicacion.titulo,
                }
            ]);

            res.status(201).json({ orden });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la orden de compra de activo' });
        }
    }

    public async aporbarOrdenCompraActivo(req: Request, res: Response) {}

    public async crearOrdenCarrito(req: Request, res: Response) {}

    public async pagarOrdenCarrito(req: Request, res: Response) {}

    public async crearOrdenServicio(req: Request, res: Response) {}

    public async pagarOrdenServicio(req: Request, res: Response) {}

}