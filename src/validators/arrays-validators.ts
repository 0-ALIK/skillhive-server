import { CustomValidator } from "express-validator";

export const noTieneRepetidos: CustomValidator = async (value: any[]): Promise<boolean> => {
    const set = new Set(value);
    
    if (set.size !== value.length) {
        throw new Error('No se permiten valores repetidos');
    }

    return true;
}