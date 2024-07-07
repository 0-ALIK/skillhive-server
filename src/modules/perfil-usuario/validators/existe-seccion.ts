import { CustomValidator } from "express-validator";
import { DatabaseConnectionService } from "../../../services/database-connection";
import { Seccion } from "../../../entity/secciones/seccion.entity";
import { ProyectosSeccion } from "../../../entity/secciones/proyectos_seccion.entity";

export const existeSeccionById: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;
    
    const seccion = await dataSource.getRepository(Seccion).findOneBy({id});

    if (!seccion) {
        throw new Error('La sección no existe');
    }

    return true;
}

export const existeProyectoSeccionById: CustomValidator = async (id: number): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;
    
    const seccion = await dataSource.getRepository(ProyectosSeccion).findOneBy({id});

    if (!seccion) {
        throw new Error('La sección no existe');
    }

    return true;
}
