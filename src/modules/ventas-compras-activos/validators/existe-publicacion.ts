import { CustomValidator } from "express-validator";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Publicacion } from "../../../entity/publicaciones/publicacion.entity";
import { Activo } from "../../../entity/activos/activos";

export const existePublicacionById: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const publicacion = await dataSource.getRepository(Publicacion).findOneBy({id});

    if (!publicacion) {
        throw new Error('No se encontró la publicación con el id '+id);
    }

    return true;
}

export const existePublicacionByIdPublic: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const publicacion = await dataSource.getRepository(Publicacion).findOne({
        where: {
            id,
            publicado: true
        }
    });

    if (!publicacion) {
        throw new Error('No se encontró la publicación con el id '+id);
    }

    return true;
}

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