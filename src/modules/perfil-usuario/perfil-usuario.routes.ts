import { Router } from "express";
import { PerfilController } from "./controllers/perfil.controller";
import { log } from "../../middlewares/log";
import { validarSesion } from "../../middlewares/validar-sesion";
import { Meta, check } from "express-validator";
import { imagenExtensiones, validarExtension, videoExtensiones } from "../../validators/validar-extension";
import { UploadedFile } from "express-fileupload";
import { mostrarErrores } from "../../middlewares/mostrar-errores";
import { filesToBody } from "../../middlewares/files";
import { SeccionesController } from "./controllers/secciones.controller";
import { TipoUsuario } from "../../entity/usuarios/usuario.entity";
import { existeProyectoSeccionById, existeSeccionById } from "./validators/existe-seccion";
import { proyectoSeccionPerteneceUsuario, seccionPerteneceUsuario } from "./middlewares/pertenece-seccion";
import { seccionEsTipo } from "./validators/es-tipo";
import { TipoSeccionEnum } from "../../entity/secciones/tipo_seccion.entity";

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

        router.get('/secciones/usuario/:usuarioid', [
            log,
            check('usuarioid', 'el id del usuario es requerido').notEmpty(),
            check('usuarioid', 'el id del usuario no es un número').isNumeric(),
            mostrarErrores
        ], seccionesController.obtenerSeccionesUsuario);

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

        router.put('/secciones/:seccionid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            seccionPerteneceUsuario(),
            check('titulo', 'el titulo es requerido').optional().notEmpty(),
            mostrarErrores
        ], seccionesController.editarSeccion);

        router.delete('/secciones/:seccionid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            seccionPerteneceUsuario(),
            mostrarErrores
        ], seccionesController.eliminarSeccion);    

        router.post('/secciones/:seccionid/proyecto', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            check('seccionid').custom( seccion => seccionEsTipo(seccion, TipoSeccionEnum.PROYECTOS) ),
            seccionPerteneceUsuario(),
            check('nombre', 'el nombre es requerido').notEmpty(),
            check('descripcion', 'la descripcion es requerida').notEmpty(),
            check('imagen', 'No es un archivo').isObject(),
            check('imagen').custom( (archivo: UploadedFile) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('enlace', 'el enlace es requerido').notEmpty(),
            check('enlace', 'el enlace no es una url valida').isURL(),
            check('fecha_inicio', 'la fecha de inicio es requerida').notEmpty(),
            check('fecha_inicio', 'la fecha de inicio no es una fecha valida').isDate(),
            check('fecha_fin', 'la fecha de fin es requerida').notEmpty(),
            check('fecha_fin', 'la fecha de fin no es una fecha valida').isDate(),
            mostrarErrores
        ], seccionesController.agregarProyectoSeccion);

        router.delete('/secciones/:seccionid/proyecto/:proyectoid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            check('seccionid').custom( seccion => seccionEsTipo(seccion, TipoSeccionEnum.PROYECTOS) ),
            seccionPerteneceUsuario(),
            check('proyectoid', 'el id del proyecto es requerido').notEmpty(),
            check('proyectoid', 'el id del proyecto no es un número').isNumeric(),
            check('proyectoid').custom( existeProyectoSeccionById ),
            proyectoSeccionPerteneceUsuario(),
            mostrarErrores
        ], seccionesController.eliminarProyectoSeccion);

        router.put('/secciones/:seccionid/proyecto/:proyectoid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            check('seccionid').custom( seccion => seccionEsTipo(seccion, TipoSeccionEnum.PROYECTOS) ),
            seccionPerteneceUsuario(),
            check('proyectoid', 'el id del proyecto es requerido').notEmpty(),
            check('proyectoid', 'el id del proyecto no es un número').isNumeric(),
            check('proyectoid').custom( existeProyectoSeccionById ),
            proyectoSeccionPerteneceUsuario(),
            check('nombre', 'el nombre es requerido').optional().notEmpty(),
            check('descripcion', 'la descripcion es requerida').optional().notEmpty(),
            check('imagen', 'No es un archivo').optional().isObject(),
            check('imagen').optional().custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('enlace', 'el enlace es requerido').optional().notEmpty(),
            check('enlace', 'el enlace no es una url valida').optional().isURL(),
            check('fecha_inicio', 'la fecha de inicio es requerida').optional().notEmpty(),
            check('fecha_inicio', 'la fecha de inicio no es una fecha valida').optional().isDate(),
            check('fecha_fin', 'la fecha de fin es requerida').optional().notEmpty(),
            check('fecha_fin', 'la fecha de fin no es una fecha valida').optional().isDate(),
            mostrarErrores
        ], seccionesController.editarProyectoSeccion);

        router.put('/secciones/:seccionid/texto', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            check('seccionid').custom( seccion => seccionEsTipo(seccion, TipoSeccionEnum.TEXTO) ),
            seccionPerteneceUsuario(),
            check('texto', 'el texto es requerido').notEmpty(),
            mostrarErrores
        ], seccionesController.editarTextoSeccion);

        router.post('/secciones/:seccionid/galeria', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            check('seccionid').custom( seccion => seccionEsTipo(seccion, TipoSeccionEnum.GALERIA) ),
            seccionPerteneceUsuario(),
            check('archivo', 'No es un archivo').isObject(),
            check('archivo').custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones,
                ...videoExtensiones
            ])),
            mostrarErrores
        ], seccionesController.agregarArchivoSeccion);

        router.delete('/secciones/:seccionid/galeria/:archivoid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('seccionid', 'el id de la seccion es requerido').notEmpty(),
            check('seccionid', 'el id de la seccion no es un número').isNumeric(),
            check('seccionid').custom( existeSeccionById ),
            check('seccionid').custom( seccion => seccionEsTipo(seccion, TipoSeccionEnum.GALERIA) ),
            seccionPerteneceUsuario(),
            check('archivoid', 'el id del archivo es requerido').notEmpty(),
            check('archivoid', 'el id del archivo no es un número').isNumeric(),
            mostrarErrores
        ], seccionesController.eliminarArchivoSeccion);

        

        return router;
    }
}