import { Seccion } from "../../../entity/secciones/seccion.entity";
import { TipoSeccionEnum } from "../../../entity/secciones/tipo_seccion.entity";
import { DatabaseConnectionService } from "../../../services/database-connection";

export const seccionEsTipo = async (id: number, tipo: TipoSeccionEnum): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;
    
    const seccion = await dataSource.getRepository(Seccion).findOne({
        where: {id},
        relations: { tipoSeccion: true }
    });
    
    if (seccion?.tipoSeccion.id !== tipo) {
        throw new Error('La sección no es del tipo esperado: '+tipo);
    }

    return true;
}