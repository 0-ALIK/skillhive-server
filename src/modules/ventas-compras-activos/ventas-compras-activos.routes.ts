import { Router } from "express";
import { VentasComprasActivosController } from './controllers/ventas-compras-activos.controller';
import { check } from "express-validator";
import { validarSesion } from "../../middlewares/validar-sesion";
import { TipoUsuario } from "../../entity/usuarios/usuario.entity";
import { mostrarErrores } from "../../middlewares/mostrar-errores";
import { existenSubcategorias, existenSubespecialidades } from "./validators/existe-especialidad-categoria";
import { filesToBody } from "../../middlewares/files";
import { validarExtension, validarImagenExtension } from "./validators/validar-extension";

export class VentasComprasActivosRoutes {

    public static get routes(): Router {
        const router = Router();

        const ventasComprasActivosController = new VentasComprasActivosController();

        router.get('/activos', [
            check('page', 'La página es requerida').optional().isInt(),
            check('limit', 'El limite es requerido').optional().isInt(),
            check('search', 'El texto de busqueda es requerido').optional().isString(),
            check('usuario', 'El usuario debe ser un numero').optional().isInt(),
            check('subcategoria', 'La subcategoria debe ser un numero').optional().isInt(),
            check('subespecialidad', 'La subespecialidad debe ser un numero').optional().isInt(),
            mostrarErrores
        ], ventasComprasActivosController.obtenerActivos);

        router.get('/activos/:id', [
            check('id', 'El id es requerido').notEmpty(),
            check('id', 'El id no es un numero').isInt(),
            mostrarErrores
        ],ventasComprasActivosController.obtenerActivoById);

        router.post('/activos', [
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('portada', 'No es un archivo').optional().isObject(),
            check('portada', 'La portada es requerida').optional().custom( validarImagenExtension ),
            check('titulo', 'El titulo es requerido').notEmpty(),
            check('descripcion_corta', 'La descripción es requerida').notEmpty(),
            check('precio', ' El precio es requerido').notEmpty(),
            check('precio', 'El precio no es un numero').isNumeric(),
            check('precio', 'El precio no puede ser negativo').isFloat({min: 0}),
            check('subcategoriasIds', 'Las subcategorias son requeridas').optional().isArray({min: 1}),
            check('subcategoriasIds.*', 'Las subcategorias deben ser ids').optional().isInt(),
            check('subcategoriasIds').optional().custom( existenSubcategorias ),
            check('subespecialidadesIds', 'Las subespecialidades son requeridas').optional().isArray({min: 1}),
            check('subespecialidadesIds.*', 'Las subespecialidades deben ser ids').optional().isInt(),
            check('subespecialidadesIds').optional().custom( existenSubespecialidades ),
            mostrarErrores
        ], ventasComprasActivosController.crearActivo);

        return router;
    }
}