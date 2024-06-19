import { CustomValidator } from "express-validator";
import { Empresa } from "../../../entity/usuarios/empresa.entity";
import { Freelancer } from "../../../entity/usuarios/freelancer.entity";
import { Usuario } from "../../../entity/usuarios/usuario.entity";
import { DatabaseConnectionService } from "../../../services/database-connection";

/**
 * Verifica si existe un usuario con la cédula de freelancer
 * @param cedula Cédula del freelancer
 * @returns true si existe, false si no existe
 */
export const existeFreelancerByCedula: CustomValidator = async (cedula: string): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;
    
    const freelancer = await dataSource.getRepository(Freelancer).findOneBy({cedula});

    if (freelancer) {
        throw new Error('Existe el freelancer con la cédula '+cedula);
    }

    return true;
}

/**
 * Verifica si existe un usuario con el correo
 * @param correo Correo del usuario
 * @returns true si existe, false si no existe
 */
export const existeUsuarioByEmail: CustomValidator = async (correo: string): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;

    const usuario = await dataSource.getRepository(Usuario).findOneBy({correo});
    
    if (usuario) {
        throw new Error('Existe el usuario con el correo '+correo);
    }

    return true;
}

/**
 * Verifica si existe un usuario con el RUC de empresa
 * @param ruc RUC de la empresa
 * @returns true si existe, false si no existe
 */
export const existeEmpresaByRUC: CustomValidator = async (ruc: string): Promise<boolean> => {
    const dataSource = DatabaseConnectionService.connection;
    
    const empresa = await dataSource.getRepository(Empresa).findOneBy({ruc});

    if (empresa) {
        throw new Error('Existe la empresa con el RUC '+ruc);
    }

    return true;
}