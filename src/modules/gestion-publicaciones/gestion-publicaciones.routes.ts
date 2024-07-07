import { Router } from "express";
import { CategoriasEspecialidadesController } from "./controllers/categorias-especialidades.controller";
import { log } from "../../middlewares/log";
import { check } from "express-validator";
import { mostrarErrores } from "../../middlewares/mostrar-errores";
import { PublicacionController } from "./controllers/publicacion.controller";
import { validarSesion } from "../../middlewares/validar-sesion";
import { publicacionPerteneceUsuario } from "./middlewares/pertenece";
import { existePublicacionById, existePublicacionByIdPublic } from "./validators/existe-publicacion";
import { noTieneRepetidos } from "../../validators/arrays-validators";
import { existenSubcategorias } from "../ventas-compras-activos/validators/existe-especialidad-categoria";
import { TipoUsuario } from "../../entity/usuarios/usuario.entity";
import { filesToBody } from "../../middlewares/files";
import { imagenExtensiones, validarExtension, videoExtensiones } from "../../validators/validar-extension";
import { UploadedFile } from "express-fileupload";
import { parseJsonCampos } from "../../middlewares/parse-json-campos";

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

        router.get('/publicaciones/tipos', [
            log,
            validarSesion()
        ], publicacionController.obtenerTiposPublicacion);

        router.get('/publicaciones', [
            log,
            check('page', 'La página es requerida').optional().isInt(),
            check('limit', 'El limite es requerido').optional().isInt(),
            check('search', 'El texto de busqueda es requerido').optional().isString(),
            check('usuario', 'El usuario debe ser un numero').optional().isInt(),
            check('subcategoria', 'La subcategoria debe ser un numero').optional().isInt(),
            check('valoracion_orden', 'El orden de valoración no es válido').optional().isIn(['ASC', 'DESC']),
            check('fecha_orden', 'El orden es requerido').notEmpty(),
            check('fecha_orden', 'El orden de fecha no es válido').isIn(['ASC', 'DESC']),
            mostrarErrores
        ], publicacionController.obtenerPublicaciones);

        router.get('/publicaciones/:publicacionid', [
            log,
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionByIdPublic ),
            mostrarErrores
        ], publicacionController.obtenerPublicacion);

        router.get('/publicaciones/propios/usuario', [
            log,
            validarSesion(),
            check('page', 'La página es requerida').optional().isInt(),
            check('limit', 'El limite es requerido').optional().isInt(),
            check('search', 'El texto de busqueda es requerido').optional().isString(),
            check('publicado', 'El estado de publicación es requerido').optional().isBoolean(),
            mostrarErrores
        ], publicacionController.obtenerPublicacionesPropias);

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

        // Publicaciones - cruds

        router.post('/publicaciones/articulo', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('titulo', 'El título es requerido').notEmpty(),
            check('descripcion_corta', 'La descripción corta es requerida').notEmpty(),
            check('portada', 'La portada es requerida').notEmpty(),
            check('portada', 'La portada no es un archivo').isObject(),
            check('portada').custom( (archivo: UploadedFile) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('contenido', 'El contenido es requerido').notEmpty(),
            parseJsonCampos(['subcategoriasIds']),
            check('subcategoriasIds', 'Las subcategorias son requeridas').optional().isArray({min: 1}),
            check('subcategoriasIds.*', 'Las subcategorias deben ser ids').optional().isInt(),
            check('subcategoriasIds').optional().custom( noTieneRepetidos ),
            check('subcategoriasIds').optional().custom( existenSubcategorias ),
            mostrarErrores
        ], publicacionController.crearPublicacionArticulo);

        router.put('/publicaciones/articulo/:publicacionid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            check('titulo', 'El título es requerido').optional().notEmpty(),
            check('descripcion_corta', 'La descripción corta es requerida').optional().notEmpty(),
            check('portada', 'La portada es requerida').optional().notEmpty(),
            check('portada', 'La portada no es un archivo').optional().isObject(),
            check('portada').optional().custom( (archivo: UploadedFile) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('contenido', 'El contenido es requerido').optional().notEmpty(),
            mostrarErrores
        ], publicacionController.editarPublicacionArticulo);

        router.delete('/publicaciones/articulo/:publicacionid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            mostrarErrores
        ], publicacionController.eliminarPublicacionArticulo);

        router.post('/publicaciones/archivos', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('titulo', 'El título es requerido').notEmpty(),
            check('descripcion_corta', 'La descripción corta es requerida').notEmpty(),
            check('portada', 'La portada es requerida').notEmpty(),
            check('portada', 'La portada no es un archivo').isObject(),
            check('portada').custom( (archivo: UploadedFile) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('archivos', 'Los archivos es requerida').optional().isArray(),
            check('archivos.*', 'Uno de los archivos no es un archivo').optional().isObject(),
            check('archivos.*').optional().custom( (archivo: UploadedFile) => validarExtension(archivo, [
                ...imagenExtensiones,
                ...videoExtensiones
            ])),
            parseJsonCampos(['subcategoriasIds']),
            check('subcategoriasIds', 'Las subcategorias son requeridas').optional().isArray({min: 1}),
            check('subcategoriasIds.*', 'Las subcategorias deben ser ids').optional().isInt(),
            check('subcategoriasIds').optional().custom( noTieneRepetidos ),
            check('subcategoriasIds').optional().custom( existenSubcategorias ),
            mostrarErrores
        ], publicacionController.crearPublicacionArchivos);

        router.put('/publicaciones/archivos/:publicacionid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            check('titulo', 'El título es requerido').optional().notEmpty(),
            check('descripcion_corta', 'La descripción corta es requerida').optional().notEmpty(),
            check('portada', 'La portada es requerida').optional().notEmpty(),
            check('portada', 'La portada no es un archivo').optional().isObject(),
            check('portada').optional().custom( (archivo: UploadedFile) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('archivos', 'Los archivos es requerida').optional().isArray(),
            check('archivos.*', 'Uno de los archivos no es un archivo').optional().isObject(),
            check('archivos.*').optional().custom( (archivo: UploadedFile) => validarExtension(archivo, [
                ...imagenExtensiones,
                ...videoExtensiones
            ])),
            parseJsonCampos(['archivosIdsEliminar']),
            check('archivosIdsEliminar', 'Los ids de archivos a eliminar son requeridos').optional().isArray({min: 1}),
            check('archivosIdsEliminar.*', 'Los ids de archivos a eliminar deben ser numeros').optional().isInt(),
            check('archivosIdsEliminar').optional().custom( noTieneRepetidos ),
            mostrarErrores
        ], publicacionController.editarPublicacionArchivos);

        router.delete('/publicaciones/archivos/:publicacionid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('publicacionid', 'El id es requerido').notEmpty(),
            check('publicacionid', 'El id no es un numero').isInt(),
            check('publicacionid').custom( existePublicacionById ),
            publicacionPerteneceUsuario(),
            mostrarErrores
        ], publicacionController.eliminarPublicacionArchivos);

        return router;
    }
}