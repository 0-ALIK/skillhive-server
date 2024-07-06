import { Router } from "express";
import { PerfilController } from "./controllers/perfil.controller";
import { log } from "../../middlewares/log";
import { validarSesion } from "../../middlewares/validar-sesion";
import { Meta, check } from "express-validator";
import { imagenExtensiones, validarExtension } from "../../validators/validar-extension";
import { UploadedFile } from "express-fileupload";
import { mostrarErrores } from "../../middlewares/mostrar-errores";
import { filesToBody } from "../../middlewares/files";
import { SeccionesController } from "./controllers/secciones.controller";
import { TipoUsuario } from "../../entity/usuarios/usuario.entity";
import { existeSeccionById } from "./validators/existe-seccion";
import { seccionPerteneceUsuario } from "./middlewares/pertenece-seccion";

export class PerfilUsuarioRoutes {
    public static get routes(): Router {
        const router = Router();

        const perfilController = new PerfilController();
        const seccionesController = new SeccionesController();

        // Rutas de secciones

        router.put('/agregar/foto', [
            log,
            validarSesion(),
            filesToBody,
            check('foto', 'la foto es requerida').notEmpty(),
            check('foto', 'la foto no es un archivo').isObject(),
            check('foto').custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            mostrarErrores
        ], perfilController.agregarFoto);

        router.put('/agregar/banner', [
            log,
            validarSesion(),
            filesToBody,
            check('banner', 'el banner es requerido').notEmpty(),
            check('banner', 'el banner no es un archivo').isObject(),
            check('banner').custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            mostrarErrores
        ], perfilController.agregarBanner);

        router.put('/editar', [
            log,
            validarSesion(),
            check('nombre', 'el nombre es requerido').optional().notEmpty(),
            check('apellido', 'el apellido es requerido').optional().notEmpty(),
            check('telefono', 'el telefono es requerido').optional().notEmpty(),
            check('telefono', 'el telefono no es un número').optional().isMobilePhone('es-PA'),
            check('paypalEmail', 'el correo de paypal es requerido').optional().notEmpty(),
            mostrarErrores
        ], perfilController.editarPerfil);

        // Rutas de secciones

        router.get('/secciones/tipos', [
            log,
            validarSesion(TipoUsuario.FREELANCER)
        ], seccionesController.obtenerTiposSecciones);

        router.get('/secciones/propias', [
            log,
            validarSesion(TipoUsuario.FREELANCER)
        ], seccionesController.obtenerSeccionesPropias);

        router.post('/secciones', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('tipo_seccion', 'el tipo de seccion es requerido').notEmpty(),
            check('titulo', 'el titulo es requerido').notEmpty(),
            mostrarErrores
        ], seccionesController.crearSeccion);

        router.put('/secciones/orden/:seccionid/:direction', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            seccionPerteneceUsuario(),
            check('direction', 'la direccion es requerida').notEmpty(),
            check('direction', 'la direccion no es valida').isIn(['up', 'down']),
            mostrarErrores
        ], seccionesController.cambiarOrdenSeccion);

        return router;
    }
}