import { UploadedFile } from "express-fileupload";
import { CustomValidator } from "express-validator";

const imagenExtensiones = ['png', 'jpg', 'jpeg', 'gif'];
const documentoExtensiones = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
const videoExtensiones = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
const audioExtensiones = ['mp3', 'wav', 'wma', 'ogg'];
const archivoExtensiones = ['zip', 'rar', '7z', 'tar', 'gz'];
const extensiones = [...imagenExtensiones, ...documentoExtensiones, ...videoExtensiones, ...audioExtensiones, ...archivoExtensiones];

export const validarImagenExtension: CustomValidator = async ( archivo: UploadedFile ): Promise<boolean> => {
    const arreglo = archivo.name.split('.');
    const extension = arreglo[ arreglo.length - 1 ].toLowerCase();

    if( !extensiones.includes(extension) ) {
        throw new Error('La extensión del archivo no es válida, debe ser: ' + imagenExtensiones.join(', '));
    }

    return true;
}

export const validarDocumentoExtension: CustomValidator = async ( archivo: UploadedFile ): Promise<boolean> => {
    const arreglo = archivo.name.split('.');
    const extension = arreglo[ arreglo.length - 1 ].toLowerCase();

    if( !extensiones.includes(extension) ) {
        throw new Error('La extensión del archivo no es válida, debe ser: ' + documentoExtensiones.join(', '));
    }

    return true;
}

export const validarVideoExtension: CustomValidator = async ( archivo: UploadedFile ): Promise<boolean> => {
    const arreglo = archivo.name.split('.');
    const extension = arreglo[ arreglo.length - 1 ].toLowerCase();

    if( !extensiones.includes(extension) ) {
        throw new Error('La extensión del archivo no es válida, debe ser: ' + videoExtensiones.join(', '));
    }

    return true;
}

export const validarAudioExtension: CustomValidator = async ( archivo: UploadedFile ): Promise<boolean> => {
    const arreglo = archivo.name.split('.');
    const extension = arreglo[ arreglo.length - 1 ].toLowerCase();

    if( !extensiones.includes(extension) ) {
        throw new Error('La extensión del archivo no es válida, debe ser: ' + audioExtensiones.join(', '));
    }

    return true;
}

export const validarArchivoExtension: CustomValidator = async ( archivo: UploadedFile ): Promise<boolean> => {
    const arreglo = archivo.name.split('.');
    const extension = arreglo[ arreglo.length - 1 ].toLowerCase();

    if( !extensiones.includes(extension) ) {
        throw new Error('La extensión del archivo no es válida, debe ser: ' + archivoExtensiones.join(', '));
    }

    return true;
}

export const validarExtension = (archivo: UploadedFile): boolean => {
    const arreglo = archivo.name.split('.');
    const extension = arreglo[ arreglo.length - 1 ].toLowerCase();

    if( !extensiones.includes(extension) ) {
        throw new Error('La extensión del archivo no es válida, debe ser: ' + extensiones.join(', '));
    }

    return true;
}