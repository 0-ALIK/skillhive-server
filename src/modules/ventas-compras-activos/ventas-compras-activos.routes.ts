import { Router } from "express";
import { VentasComprasActivosController } from './controllers/ventas-compras-activos.controller';
import { Meta, check } from "express-validator";
import { validarSesion } from "../../middlewares/validar-sesion";
import { TipoUsuario } from "../../entity/usuarios/usuario.entity";
import { mostrarErrores } from "../../middlewares/mostrar-errores";
import { existenSubcategorias, existenSubespecialidades } from "./validators/existe-especialidad-categoria";
import { filesToBody } from "../../middlewares/files";
import { imagenExtensiones, todasLasExtensiones, validarExtension } from "../../validators/validar-extension";
import { parseJsonCampos } from "../../middlewares/parse-json-campos";
import { UploadedFile } from "express-fileupload";
import { noTieneRepetidos } from "../../validators/arrays-validators";
import { PublicacionController } from "./controllers/publicacion.controller";
import { existeActivoById, existeActivoByIdPublic, existePublicacionById } from "./validators/existe-publicacion";
import { CarritoController } from "./controllers/carrito.controller";
import { existeEnCarrito } from "./middlewares/activo-carrito";
import { activoPerteneceUsuario, publicacionPerteneceUsuario } from "./middlewares/pertenece";
import { log } from "../../middlewares/log";
import { PagarController } from "./controllers/pagar.controller";

export class VentasComprasActivosRoutes {

    public static get routes(): Router {
        const router = Router();

        const ventasComprasActivosController = new VentasComprasActivosController();
        const publicacionController = new PublicacionController();
        const carrtioController = new CarritoController();
        const pagarController = new PagarController();

        // Rutas de publicaciones

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

        // Rutas de activos

        router.get('/activos', [
            log,
            check('page', 'La página es requerida').optional().isInt(),
            check('limit', 'El limite es requerido').optional().isInt(),
            check('search', 'El texto de busqueda es requerido').optional().isString(),
            check('usuario', 'El usuario debe ser un numero').optional().isInt(),
            check('subcategoria', 'La subcategoria debe ser un numero').optional().isInt(),
            check('subespecialidad', 'La subespecialidad debe ser un numero').optional().isInt(),
            mostrarErrores
        ], ventasComprasActivosController.obtenerActivos);

        router.get('/activos/:activoid', [
            log,
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoByIdPublic ),
            mostrarErrores
        ],ventasComprasActivosController.obtenerActivoById);
        
        router.get('/activos/propios/usuario', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('page', 'La página es requerida').optional().isInt(),
            check('limit', 'El limite es requerido').optional().isInt(),
            check('search', 'El texto de busqueda es requerido').optional().isString(),
            check('publicado', 'El estado de publicación es requerido').optional().isBoolean(),
            check('en_revision', 'El estado de revisión es requerido').optional().isBoolean(),
            mostrarErrores
        ], ventasComprasActivosController.obtenerActivosPropios);

        router.post('/activos', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('portada', 'No es un archivo').isObject(),
            check('portada').custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('recursos', 'Los recursos es requerida').optional().isArray(),
            check('recursos.*', 'Uno de los recursos no es un archivo').optional().isObject(),
            check('recursos.*').optional().custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...todasLasExtensiones
            ])),
            check('titulo', 'El titulo es requerido').notEmpty(),
            check('descripcion_corta', 'La descripción es requerida').notEmpty(),
            check('precio', ' El precio es requerido').notEmpty(),
            check('precio', 'El precio no es un numero').isNumeric(),
            check('precio', 'El precio no puede ser negativo').isFloat({min: 0}),
            parseJsonCampos(['subcategoriasIds', 'subespecialidadesIds']),
            check('subcategoriasIds', 'Las subcategorias son requeridas').optional().isArray({min: 1}),
            check('subcategoriasIds.*', 'Las subcategorias deben ser ids').optional().isInt(),
            check('subcategoriasIds').optional().custom( noTieneRepetidos ),
            check('subcategoriasIds').optional().custom( existenSubcategorias ),
            check('subespecialidadesIds', 'Las subespecialidades son requeridas').optional().isArray({min: 1}),
            check('subespecialidadesIds.*', 'Las subespecialidades deben ser ids').optional().isInt(),
            check('subespecialidadesIds').optional().custom( noTieneRepetidos ),
            check('subespecialidadesIds').optional().custom( existenSubespecialidades ),
            mostrarErrores
        ], ventasComprasActivosController.crearActivo);

        router.put('/activos/:activoid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoById ),
            check('portada', 'No es un archivo').optional().isObject(),
            check('portada', 'La portada es requerida').optional().custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('recursos', 'La portada es requerida').optional().isArray(),
            check('recursos.*', 'Uno de los recursos no es un archivo').optional().isObject(),
            check('recursos.*', 'Uno de los recursos es requerido').optional().custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...todasLasExtensiones
            ])),
            check('titulo', 'El titulo no puede estar vacio').optional().notEmpty(),
            check('descripcion_corta', 'La descripción no puede estar vacia').optional().notEmpty(),
            check('precio', ' El precio no puede estar vacio').optional().notEmpty(),
            check('precio', 'El precio no es un numero').optional().isNumeric(),
            check('precio', 'El precio no puede ser negativo').optional().isFloat({min: 0}),
            parseJsonCampos(['recursosElimiarIds']),
            check('recursosElimiarIds', 'Los ids de los recursos a eliminar son requeridas').optional().isArray({min: 1}),
            check('recursosElimiarIds.*', 'Los ids de los recursos a eliminar deben ser numeros').optional().isInt(),
            check('recursosElimiarIds').optional().custom( noTieneRepetidos ),
            mostrarErrores  
        ], ventasComprasActivosController.editarActivo);

        router.put('/activos/:activoid/a-revision/:action', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoById ),
            activoPerteneceUsuario(),
            check('action', 'La acción es requerida').notEmpty(),
            check('action', 'La acción no es válida, debe ser enviar o cancelar').isIn(['enviar', 'cancelar']),
            mostrarErrores
        ], ventasComprasActivosController.revisionSwitch);

        // Carrito de compras

        router.get('/carrito', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
        ], carrtioController.obtenerCarrito);

        router.post('/carrito/:activoid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoByIdPublic ),
            existeEnCarrito(false),
            mostrarErrores
        ], carrtioController.agregarActivo);

        router.delete('/carrito/:activoid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoByIdPublic ),
            existeEnCarrito(),
            mostrarErrores
        ], carrtioController.eliminarActivo);

        // Pagar

        router.post('/pagar/crear-orden/activo/:activoid', [
            log,
            validarSesion(),
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoByIdPublic ),
            mostrarErrores
        ], pagarController.crearOrdenCompraActivo);

        router.post('/pagar/aprobar-orden/activo/:activoid/:ordenid', [
            log,
            validarSesion(),
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoByIdPublic ),
            check('ordenid', 'El id es requerido').notEmpty(),
            mostrarErrores
        ], pagarController.aporbarOrdenCompraActivo);

        router.post('/pagar/crear-orden/carrito', [
            log,
            validarSesion(),
            mostrarErrores
        ], pagarController.crearOrdenCarrito);

        router.post('/pagar/pagar-orden/carrito/:ordenid', [
            log,
            validarSesion(),
            check('ordenid', 'El id es requerido').notEmpty(),
            mostrarErrores
        ], pagarController.pagarOrdenCarrito);

        return router;
    }
}