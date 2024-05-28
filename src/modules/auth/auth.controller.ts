import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { DatabaseConnectionService } from '../../services/database-connection';
import { Usuario } from '../../entity/usuarios/usuario.entity';
import { PasswordCrypt } from './helpers/password.crypt';
import { Freelancer } from '../../entity/usuarios/freelancer.entity';
import { Empresa } from '../../entity/usuarios/empresa.entity';

export class AuthController { 

    private dataSource: DataSource;

    public constructor() {
        this.dataSource = DatabaseConnectionService.connection
    }

    public async registroFreelancer(req: Request, res: Response) {
        try {
            const { nombre, correo, password, telefono, apellido, cedula, fecha_nacimiento } = req.body;

            const passHash = PasswordCrypt.hashPassword(password);
            
            await this.dataSource.transaction( async transactional => {
                
                const usuario = Usuario.create({
                    nombre,
                    correo,
                    password: passHash,
                    telefono
                });
    
                await transactional.save(usuario);
    
                const freelancer = Freelancer.create({
                    apellido,
                    cedula,
                    fecha_nacimiento,
                    usuario: usuario
                });
    
                await transactional.save(freelancer);
    
            });

            res.json({ message: 'Usuario registrado correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al registrar el usuario' });   
        }
    }

    public async registroEmpresa(req: Request, res: Response) {
        try {
            const { nombre, correo, password, telefono, ruc, razon_social } = req.body;

            const passHash = PasswordCrypt.hashPassword(password);

            await this.dataSource.transaction(async transactional => {
                const usuario = Usuario.create({
                    nombre,
                    correo,
                    password: passHash,
                    telefono
                });

                await transactional.save(usuario);

                const empresa = Empresa.create({
                    ruc,
                    razon_social,
                    usuario: usuario
                });

                await transactional.save(empresa);
            });

            res.json({ message: 'Usuario registrado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al registrar el usuario' });
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const { correo, password } = req.body;

            const usuario = await this.dataSource.getRepository(Usuario).findOne({
                where: {
                    correo
                }
            });

            if (!usuario) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            if (!PasswordCrypt.comparePassword(password, usuario.password)) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            res.json({ message: 'Usuario autenticado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al iniciar sesión' });
        }
    }
}