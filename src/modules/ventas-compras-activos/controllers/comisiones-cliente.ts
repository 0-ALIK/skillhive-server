import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { ComisionSolicitud } from '../../../entity/comisiones/comision_solicitud.entity';
import { ComisionSolicitudEstadoEnum } from '../../../entity/comisiones/comision_solicitud_estado.entity';

export class ComisionesClienteController {

    public async obtenerSolicitudes(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const solicitudes = await dataSource.getRepository(ComisionSolicitud).find({
                where: { usuario: { id: Number(usuarioAuth.id) } },
                relations: {
                    comision: {
                        usuario: true,
                    },
                    estado: true,
                }
            });

            res.status(200).json(solicitudes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    public async obtenerSolicitud(req: Request, res: Response) {
        const { solicitudid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const solicitud = await dataSource.getRepository(ComisionSolicitud).findOne({
                where: { id: Number(solicitudid) },
                relations: {
                    comision: {
                        usuario: true,
                        imagenes: true,
                        subcategorias: true,                       
                    },
                    estado: true,
                    entregables: true,
                }
            });

            res.status(200).json(solicitud);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    public async enviarSolicitud(req: Request, res: Response) {
        const { usuarioAuth, descripcion } = req.body;
        const { comisionid } = req.params;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const solicitud = ComisionSolicitud.create({
                usuario: { id: Number(usuarioAuth.id) },
                comision: { id: Number(comisionid) },
                descripcion,
                estado: { id: ComisionSolicitudEstadoEnum.PENDIENTE }
            });

            await dataSource.manager.save(solicitud);

            

            res.status(201).json({ message: 'Solicitud enviada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

}