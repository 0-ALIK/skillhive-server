import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { ComisionSolicitud } from '../../../entity/comisiones/comision_solicitud.entity';
import { ComisionSolicitudEstadoEnum } from '../../../entity/comisiones/comision_solicitud_estado.entity';

export class ComisionesClienteController {

    public async obtenerSolicitudes(req: Request, res: Response) {
        const { usuarioAuth } = req.body;
        const dataSource = DatabaseConnectionService.connection;

        try {
            const solicitudes = await dataSource.manager.find(ComisionSolicitud, {
                where: { usuario: { id: Number(usuarioAuth.id) } },
                relations: ['comision', 'estado']
            });

            res.status(200).json(solicitudes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    public async obtenerSolicitud(req: Request, res: Response) {}

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