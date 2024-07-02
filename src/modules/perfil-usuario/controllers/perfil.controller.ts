import { Request, Response } from 'express';
import { DatabaseConnectionService } from '../../../services/database-connection';
import { FileUploadService } from '../../../services/file-upload';
import { TipoUsuario, Usuario } from '../../../entity/usuarios/usuario.entity';

export class PerfilController {

    public async agregarFoto(req: Request, res: Response) {
        const { usuarioAuth, foto } = req.body;
        const dataSource = DatabaseConnectionService.connection;
        try {
            if(usuarioAuth.foto) {
                const deleteResult = await FileUploadService.delete(usuarioAuth.foto);
                if(!deleteResult.correct){
                    return res.status(500).send({ message: 'Error al agregar la foto' });
                }
            }

            const uploadResult = await FileUploadService.upload(foto);
            if(!uploadResult.correct){
                return res.status(500).send({ message: 'Error al agregar la foto' });
            }

            await dataSource.getRepository(Usuario).update(usuarioAuth.id_usuario, { foto: uploadResult.url });

            res.status(200).send({ message: 'Foto agregada correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error al agregar la foto' });
        }
    }

    public async agregarBanner(req: Request, res: Response) {
        const { usuarioAuth, banner } = req.body;
        const dataSource = DatabaseConnectionService.connection;
        try {
            if(usuarioAuth.banner) {
                const deleteResult = await FileUploadService.delete(usuarioAuth.banner);
                if(!deleteResult.correct){
                    return res.status(500).send({ message: 'Error al agregar el banner' });
                }
            }

            const uploadResult = await FileUploadService.upload(banner);
            if(!uploadResult.correct){
                return res.status(500).send({ message: 'Error al agregar el banner' });
            }

            await dataSource.getRepository(Usuario).update(usuarioAuth.id_usuario, { banner: uploadResult.url });

            res.status(200).send({ message: 'Banner agregado correctamente' });

        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error al agregar el banner' });
        }
    }

    public async editarPerfil(req: Request, res: Response) {
        const { usuarioAuth, nombre, apellido, telefono } = req.body;
        const dataSource = DatabaseConnectionService.connection;
        try {

            const editables: any = {
                nombre: nombre || usuarioAuth.nombre,
                telefono: telefono || usuarioAuth.telefono,
                freelancer: {}
            };

            if(usuarioAuth.tipo === TipoUsuario.FREELANCER) {
                editables.freelancer.apellido = apellido || usuarioAuth.freelancer.apellido;
            }

            await dataSource.getRepository(Usuario).update(usuarioAuth.id_usuario, editables);

            res.status(200).send({ message: 'Perfil editado correctamente '});

        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error al editar el perfil' });
        }
    }

}