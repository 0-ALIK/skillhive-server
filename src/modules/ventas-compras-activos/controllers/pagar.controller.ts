import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { Activo } from '../../../entity/activos/activos';
import { PayPalService, Item } from '../../../services/paypal';
import { Pago } from '../../../entity/transacciones/pago.entity';
import { TipoTransaccionEnum } from '../../../entity/transacciones/tipo_transaccion.entity';
import { Ganancia } from '../../../entity/transacciones/ganancia.entity';
import { VentasCompras } from '../../../entity/activos/ventas_compras';
import { Carrito } from '../../../entity/activos/carrito';

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
                    usuario: { id: Number(usuarioAuth.id_usuario) },
                    cantidad: activo.precio,
                    tipo: { id: TipoTransaccionEnum.COMPRA_ACTIVOS }
                });

                const pagoGuardado = await transaction.save(pago);

                const ganancia = Ganancia.create({
                    usuario: { id: activo.publicacion.usuario.id },
                    cantidad: (activo.precio - (activo.precio * Number(process.env.COMISSION))),
                    tipo: { id: TipoTransaccionEnum.COMPRA_ACTIVOS }
                });

                const gananciaGuardada = await transaction.save(ganancia);

                const compra = VentasCompras.create({
                    usuario: { id: Number(usuarioAuth.id_usuario) },
                    activo: { id: activo.id },
                    pago: { id: pagoGuardado.id },
                    ganancia: { id: gananciaGuardada.id }
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

    public async crearOrdenCarrito(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {

            const carrito = await dataSource.getRepository(Carrito).find({
                where: {
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    }
                }
            });

            const items: Item[] = carrito.map(elemento => ({
                price: elemento.activo.precio,
                description: elemento.activo.publicacion.titulo
            }));

            const orden = await PayPalService.crearOrden(items);

            res.status(201).json({ orden });
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la orden de compra de activo' });
        }
    }

    public async pagarOrdenCarrito(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const { activoid, ordenid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {

            const carrito = await dataSource.getRepository(Carrito).find({
                where: {
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    }
                }
            });

            let ordenPayoutsRequest = null;
            let ordenRequest = null;

            await dataSource.transaction(async transaction => { try {

                const comprasPromises = carrito.map(async elemento => {
                    const pago = Pago.create({
                        usuario: { id: Number(usuarioAuth.id_usuario) },
                        cantidad: elemento.activo.precio,
                        tipo: { id: TipoTransaccionEnum.COMPRA_ACTIVOS }
                    });

                    const pagoGuardado = await transaction.save(pago);

                    const ganancia = Ganancia.create({
                        usuario: { id: elemento.activo.publicacion.usuario.id },
                        cantidad: (elemento.activo.precio - (elemento.activo.precio * Number(process.env.COMISSION))),
                        tipo: { id: TipoTransaccionEnum.COMPRA_ACTIVOS }
                    });

                    const gananciaGuardada = await transaction.save(ganancia);

                    const compra = VentasCompras.create({
                        usuario: { id: Number(usuarioAuth.id_usuario) },
                        activo: { id: elemento.activo.id },
                        pago: { id: pagoGuardado.id },
                        ganancia: { id: gananciaGuardada.id }
                    });

                    await transaction.save(compra);
                });

                await Promise.all(comprasPromises);

                await transaction.delete(Carrito, {
                    usuario: { id: Number(usuarioAuth.id_usuario) }
                })

                ordenRequest = await PayPalService.aprobarOrden(ordenid);

                if(!ordenRequest || ordenRequest.statusCode < 200 || ordenRequest.statusCode >= 300) {
                    throw new Error('Error al aprobar la orden de compra');
                }

                const items = carrito.map(elemento => ({
                    correo: elemento.activo.publicacion.usuario.correo,
                    monto: elemento.activo.precio
                }));

                ordenPayoutsRequest = await PayPalService.distribuirPago(items);

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

    public async crearOrdenServicio(req: Request, res: Response) {}

    public async pagarOrdenServicio(req: Request, res: Response) {}

}