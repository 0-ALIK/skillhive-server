import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export interface UploadData {
    correct: boolean;
    url?: string;
    public_id?: string;
}

/**
 * Servicio para subir archivos a Cloudinary
 */
export class FileUploadService {

    /**
     * Sube un archivo a Cloudinary
     * @param file Archivo a subir
     * @returns Datos de la subida
     */
    public static async upload(file: any): Promise<UploadData> {
        try {
            const result = await cloudinary.uploader.upload(file.tempFilePath);
            return {
                correct: true,
                url: result.secure_url,
                public_id: result.public_id
            };
        } catch (error) {
            return {
                correct: false
            };
        }
    }

    /**
     * Elimina un archivo de Cloudinary
     * @param public_id ID del archivo a eliminar
     * @returns Datos de la eliminación
     */
    public static async delete(public_id: string): Promise<UploadData> {
        try {
            await cloudinary.uploader.destroy(public_id);
            return {
                correct: true
            };
        } catch (error) {
            return {
                correct: false
            };
        }
    }
}