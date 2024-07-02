import { CustomValidator } from "express-validator";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Activo } from "../../../entity/activos/activos";

export const existeActivoById: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const activo = await dataSource.getRepository(Activo).findOneBy({id});

    if (!activo) {
        throw new Error('No se encontró el activo con el id '+id);
    }

    return true;
}

export const existeActivoByIdPublic: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const activo = await dataSource.getRepository(Activo).findOne({
        where: {
            id,
            publicacion: {
                publicado: true
            }
        }
    });

    if (!activo) {
        throw new Error('No se encontró el activo con el id '+id);
    }

    return true;
}