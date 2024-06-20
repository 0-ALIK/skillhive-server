import { CustomValidator } from "express-validator";
import { DatabaseConnectionService } from "../services/database-connection";
import { Subespecialidad } from "../entity/especialidades/subespecialidad.entity";
import { In } from "typeorm";
import { Subcategoria } from "../entity/categorias/subcategoria.entity";

export const existenSubespecialidades: CustomValidator = async (subespecialidadesIds: number[]): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const subespecialidades = await dataSource.getRepository(Subespecialidad).findBy({id: In(subespecialidadesIds)});

    const idsNoEncontrado = subespecialidadesIds.filter(id => !subespecialidades.find(subespecialidad => subespecialidad.id === id));

    if (subespecialidades.length !== subespecialidadesIds.length) {
        throw new Error('No se encontraron las subespecialidades con los ids: '+idsNoEncontrado.join(', '));
    }

    return true;
}

export const existeSubespecialidad: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const subespecialidad = await dataSource.getRepository(Subespecialidad).findOneBy({id});

    if (!subespecialidad) {
        throw new Error('No se encontró la subespecialidad con el id '+id);
    }

    return true;
}

export const existenSubcategorias: CustomValidator = async (subcategoriasIds: number[]): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const subcategorias = await dataSource.getRepository(Subcategoria).findBy({id: In(subcategoriasIds)});

    const idsNoEncontrado = subcategoriasIds.filter(id => !subcategorias.find(subcategoria => subcategoria.id === id));

    if (subcategorias.length !== subcategoriasIds.length) {
        throw new Error('No se encontraron las subcategorias con los ids: '+idsNoEncontrado.join(', '));
    }

    return true;
}