import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { DatabaseConnectionService } from '../../services/database-connection';
import { TipoUsuario, Usuario } from '../../entity/usuarios/usuario.entity';
import { PasswordCrypt } from './helpers/password.crypt';
import { Freelancer } from '../../entity/usuarios/freelancer.entity';
import { Empresa } from '../../entity/usuarios/empresa.entity';
import { JWTService } from '../../services/jwt';
import { EmailService } from '../../services/email';
import { formatUsuarioEmpresa, formatUsuarioFreelancer } from './helpers/format-usuario';

export class AuthController { 

    public async registroFreelancer(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        try {
            const { nombre, correo, password, telefono, apellido, cedula, fecha_nacimiento } = req.body;

            const passHash = PasswordCrypt.hashPassword(password);

            let usuarioFreelancer: any = null;

            const codigoVerificacion = PasswordCrypt.generarCodigoVerificacion6Digits();
            
            await dataSource.transaction( async transactional => {
                
                const usuario = Usuario.create({
                    nombre,
                    correo,
                    password: passHash,
                    telefono,
                    codigoVerificacion
                });
    
                await transactional.save(usuario);
    
                const freelancer = Freelancer.create({
                    apellido,
                    cedula,
                    fecha_nacimiento,
                    usuario: usuario
                });
    
                await transactional.save(freelancer);

                usuarioFreelancer = formatUsuarioFreelancer(usuario, freelancer);
    
            });

            const email = EmailService.sendConfirmarCorreo(correo, 'Confirmar correo', {
                nombre,
                apellido,
                codigo: codigoVerificacion
            });

            if (!email) {
                await dataSource.getRepository(Usuario).delete(usuarioFreelancer.id_usuario);
                return res.status(500).json({ message: 'No se pudo enviar el correo de confirmación' });
            }

            res.status(201).json(usuarioFreelancer);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al registrar el usuario' });   
        }
    }

    public async registroEmpresa(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        try {
            const { nombre, correo, password, telefono, ruc, razon_social } = req.body;

            const passHash = PasswordCrypt.hashPassword(password);

            let usuarioEmpresa: any = null;

            const codigoVerificacion = PasswordCrypt.generarCodigoVerificacion6Digits();

            await dataSource.transaction(async transactional => {
                const usuario = Usuario.create({
                    nombre,
                    correo,
                    password: passHash,
                    telefono,
                    codigoVerificacion
                });

                await transactional.save(usuario);

                const empresa = Empresa.create({
                    ruc,
                    razon_social,
                    usuario: usuario
                });

                await transactional.save(empresa);

                usuarioEmpresa = formatUsuarioEmpresa(usuario, empresa);
            });

            const email = EmailService.sendConfirmarCorreo(correo, 'Confirmar correo', {
                nombre,
                codigo: codigoVerificacion
            });

            if (!email) {
                await dataSource.getRepository(Usuario).delete(usuarioEmpresa.id_usuario);
                return res.status(500).json({ message: 'No se pudo enviar el correo de confirmación' });
            }

            res.status(201).json(usuarioEmpresa);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al registrar el usuario' });
        }
    }

    public async confirmarCorreo(req: Request, res: Response) {
        const { codigo } = req.params;
        const { usuarioAuth } = req.body;
        
        if (usuarioAuth.confirmado) {
            return res.status(401).json({ message: 'El correo ya ha sido confirmado'});
        }

        const dataSource = DatabaseConnectionService.connection;

        try {
            
            const usuario = await dataSource.getRepository(Usuario).createQueryBuilder('usuario')
                .select('usuario.codigoVerificacion')
                .where('usuario.id = :id', { id: usuarioAuth.id_usuario })
                .getOne();                

            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            if (usuario.codigoVerificacion !== codigo) {
                return res.status(400).json({ message: 'Código de verificación incorrecto' });
            }

            await dataSource.getRepository(Usuario).update(usuarioAuth.id_usuario, {
                codigoVerificacion: (null) as any,
                confirmado: true
            });

            res.json({ message: 'correo confirmado' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al confirmar el correo' });
        }
    }

    public async login(req: Request, res: Response) {
        const dataSource: DataSource = DatabaseConnectionService.connection;
        try {
            const { correo, password } = req.body;

            const usuario = await dataSource.getRepository(Usuario).findOneBy({correo});

            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            if (!PasswordCrypt.comparePassword(password, usuario.password)) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            let usuarioData = null;        

            if(usuario.tipo === TipoUsuario.FREELANCER) {
                const freelancer = await dataSource.getRepository(Freelancer).findOne({
                    where: {
                        usuario: {
                            id: usuario.id
                        }
                    }
                });     
                
                if(!freelancer) {
                    console.log('freelancer no encontrado');
                    
                    return res.status(404).json({ message: 'Usuario no encontrado' });
                }

                usuarioData = formatUsuarioFreelancer(usuario, freelancer);
            }

            if(usuario.tipo === TipoUsuario.EMPRESA) {
                const empresa = await dataSource.getRepository(Empresa).findOne({
                    where: {
                        usuario: {
                            id: usuario.id
                        }
                    }
                });

                if (!empresa) {
                    console.log('empresa no encontrada');
                    
                    return res.status(404).json({ message: 'Usuario no encontrado' });
                }

                usuarioData = formatUsuarioEmpresa(usuario, empresa);
            }

            const token = await JWTService.generarToken({id: usuarioData.id_usuario});

            if (!token) {
                return res.status(500).json({ message: 'No se pudo generar el token' });
            }

            res.json({
                usuario: usuarioData,
                token
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al iniciar sesión' });
        }
    }
}