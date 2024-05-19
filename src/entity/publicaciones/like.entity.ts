import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Publicacion } from "./publicacion.entity";

@Entity()
export class Like {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.likes)
    usuario: Usuario;

    // Relacion M:1 con Publicacion
    @ManyToOne(() => Publicacion, publicacion => publicacion.likes)
    publicacion: Publicacion;
    
}