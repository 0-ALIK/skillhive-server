import { BaseEntity, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Activo } from "./activos";

@Entity()
export class Carrito extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.carritos)
    usuario: Usuario;

    // Relacion M:1 con Activo
    @ManyToOne(() => Activo, activo => activo.carritos)
    activo: Activo;
}