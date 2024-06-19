import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";
import { check } from "express-validator";
import { mostrarErrores } from "../../middlewares/mostrar-errores";
import { existeEmpresaByRUC, existeFreelancerByCedula, existeUsuarioByEmail } from "./validators/existe-usuario";
import { validarSesion } from "../../middlewares/validar-sesion";

export class AuthRoutes {

    public static get routes(): Router {
        const router = Router();

        const authController = new AuthController();

        router.post('/login', [
            check('correo', 'El correo es requerido').notEmpty(),
            check('correo', 'El correo no es válido').isEmail(),
            check('password', 'La contraseña es requerida').notEmpty(),
            mostrarErrores
        ], authController.login);

        router.post('/registro-freelancer', [
            check('correo', 'El correo es requerido').notEmpty(),
            check('correo', 'El correo no es válido').isEmail(),
            check('correo').custom( existeUsuarioByEmail ),
            check('password', 'La contraseña es requerida').notEmpty(),
            check('nombre', 'El nombre es requerido').notEmpty(),
            check('apellido', 'El apellido es requerido').notEmpty(),
            check('cedula', 'La cedula es requerida').notEmpty(),
            check('cedula', 'La cedula no es válida').isLength({min: 5, max: 20}),
            check('cedula').custom( existeFreelancerByCedula ),
            check('fecha_nacimiento', 'La fecha de nacimiento es requerida').notEmpty(),
            check('fecha_nacimiento', 'La fecha de nacimiento no es válida').isDate(),
            check('telefono', 'El telefono es requerido').notEmpty(),
            check('telefono', 'El telefono no es válido').isMobilePhone('es-PA'),
            mostrarErrores
        ], authController.registroFreelancer);

        router.post('/registro-empresa', [
            check('correo', 'El correo es requerido').notEmpty(),
            check('correo', 'El correo no es válido').isEmail(),
            check('correo').custom( existeUsuarioByEmail ),
            check('password', 'La contraseña es requerida').notEmpty(),
            check('nombre', 'El nombre es requerido').notEmpty(),
            check('ruc', 'El ruc es requerido').notEmpty(),
            check('ruc', 'El ruc no es válido').isLength({min: 2, max: 20}),
            check('ruc').custom( existeEmpresaByRUC ),
            check('razon_social', 'La razon social es requerida').notEmpty(),
            check('telefono', 'El telefono es requerido').notEmpty(),
            check('telefono', 'El telefono no es válido').isMobilePhone('es-PA'),
        ], authController.registroEmpresa);

        router.get('/confirmar-correo/:codigo', [
            validarSesion(null, false),
            check('codigo', 'El código de verificación es requerido').notEmpty(),
            mostrarErrores
        ], authController.confirmarCorreo);

        return router;
    }
}