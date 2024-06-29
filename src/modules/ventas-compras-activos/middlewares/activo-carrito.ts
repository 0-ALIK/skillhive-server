import { NextFunction, Request, Response } from "express";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Carrito } from "../../../entity/activos/carrito";

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