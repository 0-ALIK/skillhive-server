import { Empresa } from "../../../entity/usuarios/empresa.entity";
import { Freelancer } from "../../../entity/usuarios/freelancer.entity";
import { Usuario } from "../../../entity/usuarios/usuario.entity";

export function formatUsuarioFreelancer(usuarioBase: Usuario, freelancer: Freelancer): any {
    let usuario: any = {
        id_usuario: usuarioBase.id,
        id_freelancer: freelancer.id,
        ...usuarioBase,
        ...freelancer
    };

    delete usuario.id;
    delete usuario.password;
    delete usuario.codigoVerificacion;
    delete usuario.usuario;

    return usuario;
}

export function formatUsuarioEmpresa(usuarioBase: Usuario, empresa: Empresa): any {
    let usuario: any = {
        id_usuario: usuarioBase.id,
        id_empresa: empresa.id,
        ...usuarioBase,
        ...empresa
    };

    delete usuario.id;
    delete usuario.password;
    delete usuario.codigoVerificacion;
    delete usuario.usuario;

    return usuario;
}

export function formatUsuario(usuarioBase: Usuario): any {
    let usuario: any = {
        id_usuario: usuarioBase.id,
        ...usuarioBase
    };

    delete usuario.id;
    delete usuario.password;
    delete usuario.codigoVerificacion;
    delete usuario.usuario;

    return usuario;
}