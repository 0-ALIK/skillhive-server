import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Activo } from '../../../entity/activos/activos';
import { PayPalService } from '../../../services/paypal';
import { Pago } from '../../../entity/transacciones/pago.entity';
import { TipoTransaccionEnum } from '../../../entity/transacciones/tipo_transaccion.entity';
import { Ganancia } from '../../../entity/transacciones/ganancia.entity';
import { VentasCompras } from '../../../entity/activos/ventas_compras';

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

    public async aporbarOrdenCompraActivo(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const { activoid, ordenid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            
            const activo = await dataSource.getRepository(Activo).findOne({
                where: { id: Number(activoid) },
                relations: { 
                    publicacion: {
                        usuario: true  
                    }
                }
            });

            if (!activo) {
                return res.status(404).json({ message: 'Activo no encontrado' });
            }

            let ordenPayoutsRequest = null;

            let ordenRequest = null;
            
            await dataSource.transaction(async transaction => { try {

                const pago = Pago.create({
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    },
                    cantidad: activo.precio,
                    tipo: {
                        id: TipoTransaccionEnum.COMPRA_ACTIVOS
                    }
                });

                const pagoGuardado = await transaction.save(pago);

                const ganancia = Ganancia.create({
                    usuario: {
                        id: activo.publicacion.usuario.id
                    },
                    cantidad: activo.precio,
                    tipo: {
                        id: TipoTransaccionEnum.COMPRA_ACTIVOS
                    }
                });

                const gananciaGuardada = await transaction.save(ganancia);

                const compra = VentasCompras.create({
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    },
                    activo: {
                        id: activo.id
                    },
                    pago: {
                        id: pagoGuardado.id
                    },
                    ganancia: {
                        id: gananciaGuardada.id
                    }
                });

                await transaction.save(compra);

                ordenRequest = await PayPalService.aprobarOrden(ordenid);

                if(!ordenRequest || ordenRequest.statusCode < 200 || ordenRequest.statusCode >= 300) {
                    throw new Error('Error al aprobar la orden de compra');
                }

                ordenPayoutsRequest = await PayPalService.distribuirPago([
                    {
                        correo: activo.publicacion.usuario.correo,
                        monto: activo.precio
                    }
                ]);

                if(!ordenPayoutsRequest || ordenPayoutsRequest.statusCode < 200 || ordenPayoutsRequest.statusCode >= 300) {
                    throw new Error('Error al distribuir el pago');
                }

            } catch (error) {
                console.error(error);
                throw error;
            }});

            res.status(201).json({ ordenRequest });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la orden de compra de activo' });
        }
    }

    public async crearOrdenCarrito(req: Request, res: Response) {}

    public async pagarOrdenCarrito(req: Request, res: Response) {}

    public async crearOrdenServicio(req: Request, res: Response) {}

    public async pagarOrdenServicio(req: Request, res: Response) {}

}