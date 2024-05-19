import { create } from "domain";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Like } from "./like.entity";
import { Comentario } from "./comentario.entity";
import { TipoPublicacion } from "./tipo_publicacion.entity";
import { Subcategoria } from "../categorias/subcategoria.entity";
import { Subespecialidad } from "../especialidades/subespecialidad.entity";

@Entity()
export class Publicacion {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    titulo: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;
    
    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.publicaciones)
    usuario: Usuario;

    // Relacion 1:M con Like
    @OneToMany(() => Like, like => like.publicacion)
    likes: Like[];

    // Relacion 1:M con Comentario
    @OneToMany(() => Comentario, comentario => comentario.publicacion)
    comentarios: Comentario[];

    // Relacion M:1 con TipoPublicacion
    @ManyToOne(() => TipoPublicacion, tipo => tipo.publicaciones)
    tipo: TipoPublicacion;

    // Relacion M:N con subcategorias
    @ManyToMany(() => Subcategoria, subcategoria => subcategoria.publicaciones)
    @JoinTable({name: 'publicacion_subcategoria'})
    subcategorias: Subcategoria[];

    // Relacion M:N con subespecialidades
    @ManyToMany(() => Subespecialidad, subespecialidad => subespecialidad.publicaciones)
    @JoinTable({name: 'publicacion_subespecialidad'})
    subespecialidades: Subespecialidad[];
}
