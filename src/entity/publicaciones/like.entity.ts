import { BaseEntity, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Publicacion } from "./publicacion.entity";

@Entity()
export class Like extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.likes, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    usuario: Usuario;

    // Relacion M:1 con Publicacion
    @ManyToOne(() => Publicacion, publicacion => publicacion.likes, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    publicacion: Publicacion;
    
}