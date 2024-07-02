import { Router } from "express";
import { CategoriasEspecialidadesController } from "./controllers/categorias-especialidades.controller";
import { log } from "../../middlewares/log";
import { check } from "express-validator";
import { mostrarErrores } from "../../middlewares/mostrar-errores";
import { PublicacionController } from "./controllers/publicacion.controller";
import { validarSesion } from "../../middlewares/validar-sesion";
import { publicacionPerteneceUsuario } from "./middlewares/pertenece";
import { existePublicacionById } from "./validators/existe-publicacion";
import { noTieneRepetidos } from "../../validators/arrays-validators";
import { existenSubcategorias, existenSubespecialidades } from "../ventas-compras-activos/validators/existe-especialidad-categoria";

export class GestionPublicacionesRoutes {

    public static get routes(): Router {
        const router = Router();

        const categoriasEspecialidadesController = new CategoriasEspecialidadesController();
        const publicacionController = new PublicacionController();

        // Categorias y especialidades

        router.get('/categorias', [
            log
        ], categoriasEspecialidadesController.obtenerCategorias);

        router.get('/subcategorias', [
            log,
            check('catid', 'El id de la categoria no es numero').optional().isInt(),
            mostrarErrores
        ], categoriasEspecialidadesController.obtenerSubcategorias);

        router.get('/especialidades', [
            log
        ], categoriasEspecialidadesController.obtenerEspecialidades);

        router.get('/subespecialidades', [
            log,
            check('espid', 'El id de la especialidad no es numero').optional().isInt(),
            mostrarErrores
        ], categoriasEspecialidadesController.obtenerSubespecialidades);

        // Publicaciones

        router.post('/publicaciones/:publicacionid/subcategorias', [
            log,
            validarSesion(),
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            check('subcategoriasIds', 'Las subcategorias son requeridas').optional().isArray({min: 1}),
            check('subcategoriasIds.*', 'Las subcategorias deben ser ids').optional().isInt(),
            check('subcategoriasIds').optional().custom( noTieneRepetidos ),
            check('subcategoriasIds').optional().custom( existenSubcategorias ),
            mostrarErrores
        ], publicacionController.agregarSubcategoria);

        router.delete('/publicaciones/:publicacionid/:subcatid/subcategorias', [
            log,
            validarSesion(),
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            check('subcatid', 'El id de la subcategoria es requerido').notEmpty(),
            check('subcatid', 'El id de la subcategoria no es un numero').isInt(),
            mostrarErrores
        ], publicacionController.eliminarSubcategoria);

        router.post('/publicaciones/:publicacionid/subespecialidades', [
            log,
            validarSesion(),
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            check('subespecialidadesIds', 'Las subespecialidades son requeridas').optional().isArray({min: 1}),
            check('subespecialidadesIds.*', 'Las subespecialidades deben ser ids').optional().isInt(),
            check('subespecialidadesIds').optional().custom( noTieneRepetidos ),
            check('subespecialidadesIds').optional().custom( existenSubespecialidades ),
            mostrarErrores
        ], publicacionController.agregarSubespecialidad);

        router.delete('/publicaciones/:publicacionid/:subespid/subespecialidades', [
            log,
            validarSesion(),
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            check('subespid', 'El id de la subespecialidad es requerido').notEmpty(),
            check('subespid', 'El id de la subespecialidad no es un numero').isInt(),
            mostrarErrores
        ], publicacionController.eliminarSubespecialidad);

        router.put('/publicaciones/:publicacionid/publicar-switch/:action', [
            log,
            validarSesion(),
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            check('action', 'La acción es requerida').notEmpty(),
            check('action', 'La acción no es válida').isIn(['on', 'off']),
            mostrarErrores
        ], publicacionController.publicarSwitch);

        return router;
    }
}