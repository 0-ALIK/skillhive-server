import { UploadedFile } from "express-fileupload";

export const imagenExtensiones = ['png', 'jpg', 'jpeg', 'gif'];
export const documentoExtensiones = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'xml', 'json', 'odt'];
export const videoExtensiones = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
export const audioExtensiones = ['mp3', 'wav', 'wma', 'ogg'];
export const archivoExtensiones = ['zip', 'rar', '7z', 'tar', 'gz'];
export const todasLasExtensiones = [...imagenExtensiones, ...documentoExtensiones, ...videoExtensiones, ...audioExtensiones, ...archivoExtensiones];

export const validarExtension = (archivo: UploadedFile | UploadedFile[], extensiones: string[]): boolean => {
    if (Array.isArray(archivo)) {
        archivo.forEach(archivo => {
            const arreglo = archivo.name.split('.');
            const extension = arreglo[ arreglo.length - 1 ].toLowerCase();

            if( !extensiones.includes(extension) ) {
                throw new Error('La extensión del archivo '+archivo.name+' no es válida, debe ser: ' + imagenExtensiones.join(', '));
            }
        });
    } else {
        const arreglo = archivo.name.split('.');
        const extension = arreglo[ arreglo.length - 1 ].toLowerCase();

        if( !extensiones.includes(extension) ) {
            throw new Error('La extensión del archivo '+ archivo.name+' no es válida, debe ser: ' + imagenExtensiones.join(', '));
        }
    }

    return true;
}