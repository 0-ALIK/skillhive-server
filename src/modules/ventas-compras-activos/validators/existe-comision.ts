import { CustomValidator } from "express-validator";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Comision } from "../../../entity/comisiones/comision.entity";
import { ComisionSolicitud } from "../../../entity/comisiones/comision_solicitud.entity";

export const existeComisionById: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const comision = await dataSource.getRepository(Comision).findOneBy({id});

    if (!comision) {
        throw new Error('La comisión no existe');
    }

    return true;
}

export const existeSolicitudComisionById: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const solicitud = await dataSource.getRepository(ComisionSolicitud).findOneBy({id});

    if (!solicitud) {
        throw new Error('La solicitud de comisión no existe');
    }

    return true;
}