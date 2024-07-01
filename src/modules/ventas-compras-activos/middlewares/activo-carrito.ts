import { NextFunction, Request, Response } from "express";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Carrito } from "../../../entity/activos/carrito";
import { VentasCompras } from "../../../entity/activos/ventas_compras";

export function existeEnCarrito(existe: boolean = true) {

    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { activoid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            
            const carrito = await dataSource.getRepository(Carrito).find({
                where: {
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    },
                    activo: {
                        id: Number(activoid)
                    }
                }
            });

            if (carrito.length === 0 && existe) {
                return res.status(400).json({ message: 'El activo no está en el carrito' });
            } else if (carrito.length > 0 && !existe) {
                return res.status(400).json({ message: 'El activo ya está en el carrito' });
            }

            next();

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si el activo está en el carrito' });
        }
    }
}

export function carritoEstaVacio(vacio: boolean = true) {
    
    return async (req: Request, res: Response, next: NextFunction) => {
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

            if (carrito.length === 0 && vacio) {
                return res.status(400).json({ message: 'El carrito está vacío' });
            } else if (carrito.length > 0 && !vacio) {
                return res.status(400).json({ message: 'El carrito no está vacío' });
            }

            next();

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si el carrito está vacío' });
        }
    }
}

export function activoYaComprado(comprado: boolean = true) {

    return async (req: Request, res: Response, next: NextFunction) => {
        const { usuarioAuth } = req.body;
        const { activoid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            
            const activoComprado = await dataSource.getRepository(VentasCompras).findOne({
                where: {
                    usuario: {
                        id: Number(usuarioAuth.id_usuario)
                    },
                    activo: {
                        id: Number(activoid)
                    }
                }
            });

            if (activoComprado && comprado) {
                return res.status(400).json({ message: 'El activo ya fue comprado' });
            } else if (!activoComprado && !comprado) {
                return res.status(400).json({ message: 'El activo no fue comprado' });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al verificar si el activo fue comprado' });
        }
    }

}