import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Publicacion } from "./publicacion.entity";

@Entity()
export class Comentario extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 150})
    comentario: string;

    @CreateDateColumn()
    createdAt: Date; 

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.comentarios)
    usuario: Usuario;

    // Relacion M:1 con Publicacion
    @ManyToOne(() => Publicacion, publicacion => publicacion.comentarios)
    publicacion: Publicacion;
}