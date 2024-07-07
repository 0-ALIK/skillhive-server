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
import { existeActivoById, existeActivoByIdPublic } from "./validators/existe-publicacion";
import { CarritoController } from "./controllers/carrito.controller";
import { activoYaComprado, carritoEstaVacio, existeEnCarrito } from "./middlewares/activo-carrito";
import { activoPerteneceUsuario, comisionPerteceUsuario, solicitudComisionPerteneceUsuario, solicitudComisionPerteneceUsuarioCliente } from "./middlewares/pertenece";
import { log } from "../../middlewares/log";
import { PagarController } from "./controllers/pagar.controller";
import { ComisionesController } from "./controllers/comisiones.controller";
import { existeComisionById, existeSolicitudComisionById } from "./validators/existe-comision";
import { openComision } from "./middlewares/open-comision";
import { ComisionesClienteController } from "./controllers/comisiones-cliente";

export class VentasComprasActivosRoutes {

    public static get routes(): Router {
        const router = Router();

        const ventasComprasActivosController = new VentasComprasActivosController();
        const carrtioController = new CarritoController();
        const pagarController = new PagarController();
        const comisionesController = new ComisionesController();
        const comisionesClienteController = new ComisionesClienteController();

        // Rutas de activos

        router.get('/activos', [
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
            parseJsonCampos(['subcategoriasIds']),
            check('subcategoriasIds', 'Las subcategorias son requeridas').optional().isArray({min: 1}),
            check('subcategoriasIds.*', 'Las subcategorias deben ser ids').optional().isInt(),
            check('subcategoriasIds').optional().custom( noTieneRepetidos ),
            check('subcategoriasIds').optional().custom( existenSubcategorias ),
            mostrarErrores
        ], ventasComprasActivosController.crearActivo);

        router.put('/activos/:activoid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoById ),
            activoPerteneceUsuario(),
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
            activoYaComprado(true),
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
            activoYaComprado(true),
            mostrarErrores
        ], pagarController.crearOrdenCompraActivo);

        router.post('/pagar/aprobar-orden/activo/:activoid/:ordenid', [
            log,
            validarSesion(),
            check('activoid', 'El id es requerido').notEmpty(),
            check('activoid', 'El id no es un numero').isInt(),
            check('activoid').custom( existeActivoByIdPublic ),
            activoYaComprado(true),
            check('ordenid', 'El id es requerido').notEmpty(),
            mostrarErrores
        ], pagarController.aporbarOrdenCompraActivo);

        router.post('/pagar/crear-orden/carrito', [
            log,
            validarSesion(),
            carritoEstaVacio(true),
            mostrarErrores
        ], pagarController.crearOrdenCarrito);

        router.post('/pagar/pagar-orden/carrito/:ordenid', [
            log,
            validarSesion(),
            check('ordenid', 'El id es requerido').notEmpty(),
            carritoEstaVacio(true),
            mostrarErrores
        ], pagarController.pagarOrdenCarrito);

        // Comisiones o servicios | global

        router.get('/comisiones', [
            log,
            check('page', 'La página es requerida').optional().isInt(),
            check('limit', 'El limite es requerido').optional().isInt(),
            check('search', 'El texto de busqueda es requerido').optional().isString(),
            check('usuario', 'El usuario debe ser un numero').optional().isInt(),
            check('subcategoria', 'La subcategoria debe ser un numero').optional().isInt(),
            mostrarErrores
        ], comisionesController.obtenerComisiones);

        router.get('/comisiones/:comisionid', [
            log,
            check('comisionid', 'El id es requerido').notEmpty(),
            check('comisionid', 'El id no es un numero').isInt(),
            check('comisionid').custom( existeComisionById ),
            mostrarErrores 
        ], comisionesController.obtenerComisionById);

        router.get('/comisiones/estados/solicitudes', [
            log,
        ], comisionesController.obtenerEstados);

        // Comisiones o servicios | vendedor

        router.post('/comisiones', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            openComision,
            filesToBody,
            parseJsonCampos(['subcategoriasIds']),
            check('imagen', 'No es un archivo').isObject(),
            check('imagen').custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('imagenes_ejemplo', 'Las imagenes de ejemplo son requeridas').optional().isArray(),
            check('imagenes_ejemplo.*', 'Una de las imagenes de ejemplo no es un archivo').optional().isObject(),
            check('imagenes_ejemplo.*').optional().custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('titulo', 'El titulo es requerido').notEmpty(),
            check('descripcion', 'La descripción es requerida').notEmpty(),
            check('precio', ' El precio es requerido').notEmpty(),
            check('precio', 'El precio no es un numero').isNumeric(),
            check('precio', 'El precio no puede ser negativo').isFloat({min: 0}),
            check('subcategoriasIds', 'Las subcategorias son requeridas').optional().isArray({min: 1}),
            check('subcategoriasIds.*', 'Las subcategorias deben ser ids').optional().isInt(),
            check('subcategoriasIds').optional().custom( noTieneRepetidos ),
            check('subcategoriasIds').optional().custom( existenSubcategorias ),
        ], comisionesController.crearComision);

        router.put('/comisiones/:comisionid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            openComision,
            filesToBody,
            parseJsonCampos(['subcategoriasIds', 'imagenesEliminarIds']),
            check('comisionid', 'El id es requerido').notEmpty(),
            check('comisionid', 'El id no es un numero').isInt(),
            check('comisionid').custom( existeComisionById ),
            comisionPerteceUsuario(),
            check('imagen', 'No es un archivo').optional().isObject(),
            check('imagen').optional().custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('imagenes_ejemplo', 'Las imagenes de ejemplo son requeridas').optional().isArray(),
            check('imagenes_ejemplo.*', 'Una de las imagenes de ejemplo no es un archivo').optional().isObject(),
            check('imagenes_ejemplo.*').optional().custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...imagenExtensiones
            ])),
            check('titulo', 'El titulo es requerido').optional().notEmpty(),
            check('descripcion', 'La descripción es requerida').optional().notEmpty(),
            check('precio', ' El precio es requerido').optional().notEmpty(),
            check('precio', 'El precio no es un numero').optional().isNumeric(),
            check('precio', 'El precio no puede ser negativo').optional().isFloat({min: 0}),
            check('subcategoriasIds', 'Las subcategorias son requeridas').optional().isArray({min: 1}),
            check('subcategoriasIds.*', 'Las subcategorias deben ser ids').optional().isInt(),
            check('subcategoriasIds').optional().custom( noTieneRepetidos ),
            check('subcategoriasIds').optional().custom( existenSubcategorias ),
            check('imagenesEliminarIds', 'Los ids de las imagenes a eliminar son requeridas').optional().isArray({min: 1}),
            check('imagenesEliminarIds.*', 'Los ids de las imagenes a eliminar deben ser numeros').optional().isInt(),
            check('imagenesEliminarIds').optional().custom( noTieneRepetidos ),
            mostrarErrores
        ], comisionesController.actualizarComision);

        router.put('/comisiones/open-comision-switch/:action', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('action', 'La acción es requerida').notEmpty(),
            check('action', 'La acción no es válida').isIn(['on', 'off']),
            mostrarErrores
        ], comisionesController.openComisionSwitch)

        router.get('/comisiones/solicitudes/recibidas', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('estadoid', 'el estado de las solicitudes no es valido').optional().isString(),
            check('comisionid', 'el id de comision debe ser numero').optional().isInt(),
            check('comisionid').optional().custom( existeComisionById ), 
            mostrarErrores
        ], comisionesController.obtenerSolictudesComisionesRecibidas);

        router.get('/comisiones/solicitudes/recibidas/:solicitudid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('solicitudid', 'el id de la solicitud es requerido').notEmpty(),
            check('solicitudid', 'el id de la solicitud no es un numero').isInt(),
            check('solicitudid').custom( existeSolicitudComisionById ),
            solicitudComisionPerteneceUsuario(),
            mostrarErrores
        ], comisionesController.obtenerSolictudComisionRecibida);

        router.put('/comisiones/solicitudes/recibir/:solicitudid/:action', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('solicitudid', 'el id de la solicitud es requerido').notEmpty(),
            check('solicitudid', 'el id de la solicitud no es un numero').isInt(),
            check('solicitudid').custom( existeSolicitudComisionById ),
            solicitudComisionPerteneceUsuario(),
            check('action', 'La acción es requerida').notEmpty(),
            check('action', 'La acción no es válida').isIn(['aceptar', 'rechazar']),
            mostrarErrores
        ], comisionesController.recibirSolicitudComision);

        router.put('/comisiones/solicitudes/cancelar/:solicitudid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('solicitudid', 'el id de la solicitud es requerido').notEmpty(),
            check('solicitudid', 'el id de la solicitud no es un numero').isInt(),
            check('solicitudid').custom( existeSolicitudComisionById ),
            solicitudComisionPerteneceUsuario(),
            mostrarErrores
        ], comisionesController.cancelarComision);

        router.post('/comisiones/entregar/:solicitudid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            filesToBody,
            check('entregables', 'Los entregables son requeridos').isArray({min: 1}),
            check('entregables.*', 'Uno de los entregables no es archivo').isObject(),
            check('entregables.*').custom( (archivo: UploadedFile, meta: Meta) => validarExtension(archivo, [
                ...todasLasExtensiones
            ])),
            check('solicitudid', 'El id es requerido').notEmpty(),
            check('solicitudid', 'El id no es un numero').isInt(),
            check('solicitudid').custom( existeSolicitudComisionById ),
            solicitudComisionPerteneceUsuario(),
            mostrarErrores
        ], comisionesController.entregarComision);

        // Comisiones o servicios | cliente

        router.get('/c/comisiones/solicitudes', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
        ], comisionesClienteController.obtenerSolicitudes);

        router.get('/c/comisiones/solicitudes/:solicitudid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('solicitudid', 'El id es requerido').notEmpty(),
            check('solicitudid', 'El id no es un numero').isInt(),
            check('solicitudid').custom( existeSolicitudComisionById ),
            solicitudComisionPerteneceUsuarioCliente(),
            check('solicitudid').custom( existeSolicitudComisionById ),
            mostrarErrores
        ], comisionesClienteController.obtenerSolicitud);

        router.post('/c/comisiones/solicitudes/enviar/:comisionid', [
            log,
            validarSesion(TipoUsuario.FREELANCER),
            check('comisionid', 'El id es requerido').notEmpty(),
            check('comisionid', 'El id no es un numero').isInt(),
            check('comisionid').custom( existeComisionById ),
            check('descripcion', 'La descripción es requerida').notEmpty(),
            mostrarErrores
        ], comisionesClienteController.enviarSolicitud);

        return router;
    }
}