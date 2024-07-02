import { Router } from "express";
import { PerfilController } from "./controllers/perfil.controller";
import { log } from "../../middlewares/log";
import { validarSesion } from "../../middlewares/validar-sesion";
import { Meta, check } from "express-validator";
import { imagenExtensiones, validarExtension } from "../../validators/validar-extension";
import { UploadedFile } from "express-fileupload";
import { mostrarErrores } from "../../middlewares/mostrar-errores";

export class PerfilUsuarioRoutes {
    public static get routes(): Router {
        const router = Router();

        const perfilController = new PerfilController();

        router.put('/agregar/foto', [
            log,
            validarSesion(),
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
            mostrarErrores
        ], perfilController.editarPerfil);
        
        return router;
    }
}