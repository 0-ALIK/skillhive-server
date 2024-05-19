import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Publicacion } from "./publicacion.entity";

@Entity()
export class Comentario {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    comentario: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date; 

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.comentarios)
    usuario: Usuario;

    // Relacion M:1 con Publicacion
    @ManyToOne(() => Publicacion, publicacion => publicacion.comentarios)
    publicacion: Publicacion;
}