import { compareSync, genSaltSync, hashSync } from 'bcrypt';

/**
 * Clase helper que se encarga de hashear y comparar passwords
 */
export class PasswordCrypt {

    /**
     * Este metodo recibe un password y lo hashea
     * @param password El password a hashear
     * @returns El password hasheado
     */
    public static hashPassword(password: string): string {
        const salt = genSaltSync();
        const passwordHash = hashSync(password, salt);
        return passwordHash;
    }

    /**
     * Este metodo recibe un password y un hash y los compara
     * @param password El password a comparar
     * @param hash El hash a comparar
     * @returns True si son iguales, false si no
     */
    public static comparePassword(password: string, hash: string): boolean {
        return compareSync(password, hash);
    }
}