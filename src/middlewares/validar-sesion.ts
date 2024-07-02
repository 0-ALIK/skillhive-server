import { NextFunction, Request, Response } from "express";
import { JWTService } from "../services/jwt";
import { TipoUsuario, Usuario } from "../entity/usuarios/usuario.entity";
import { DatabaseConnectionService } from "../services/database-connection";
import { Freelancer } from "../entity/usuarios/freelancer.entity";
import { Empresa } from "../entity/usuarios/empresa.entity";
import { formatUsuario, formatUsuarioEmpresa, formatUsuarioFreelancer } from "../modules/auth/helpers/format-usuario";

export function validarSesion(tipoUsuario: TipoUsuario | null = null, validarConfirmacion: boolean = true) {

    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header('x-token');
        const dataSource = DatabaseConnectionService.connection;
        let usuarioAuth: any = null;
    
        if (!token) {
            return res.status(401).json({msg: 'No hay token en la petición'});
        }
    
        try {
    
            const payload: any = await JWTService.validarToken(token);

            const usuario = await dataSource.getRepository(Usuario).findOneBy({id: payload.id});

            if(!usuario) {
                return res.status(401).json({msg: 'Usuario no encontrado'});
            }

            if(validarConfirmacion && !usuario.confirmado) {
                return res.status(401).json({msg: 'Usuario no confirmado'});
            }

            if(tipoUsuario && usuario.tipo !== tipoUsuario) {
                return res.status(401).json({msg: 'Usuario no autorizado'});
            }

            if(usuario.tipo === TipoUsuario.FREELANCER) {
                const freelancer = await dataSource.getRepository(Freelancer).findOneBy({usuario: {id: usuario.id}});
                if(!freelancer) {
                    return res.status(401).json({msg: 'Usuario no encontrado'});
                }
                usuarioAuth = formatUsuarioFreelancer(usuario, freelancer); 

            } else if(usuario.tipo === TipoUsuario.EMPRESA) {
                const empresa = await dataSource.getRepository(Empresa).findOneBy({usuario: {id: usuario.id}});
                if(!empresa) {
                    return res.status(401).json({msg: 'Usuario no encontrado'});
                }
                usuarioAuth = formatUsuarioEmpresa(usuario, empresa);
                
            } else {
                usuarioAuth = formatUsuario(usuario);
            }

            req.body.usuarioAuth = usuarioAuth;
            
            next();
    
        } catch (error) {
            console.error(error);
            res.status(500).json({msg: 'Error al validar el token'});
        }
    }
}