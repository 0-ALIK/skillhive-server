import { BaseEntity, Column, CreateDateColumn,  Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Like } from "./like.entity";
import { Comentario } from "./comentario.entity";
import { TipoPublicacion } from "./tipo_publicacion.entity";
import { Subcategoria } from "../categorias/subcategoria.entity";
import { Subespecialidad } from "../especialidades/subespecialidad.entity";
import { OfertaEmpleo } from "./oferta_empleo.entity";
import { Articulo } from "./articulo.entity";
import { Archivo } from "./archivo.entity";
import { Activo } from "../activos/activos";

@Entity()
export class Publicacion extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 100})
    titulo: string;

    @Column({nullable: false, type: 'text'})
    descripcion_corta: string;

    @Column({nullable: false})
    portada: string;

    @Column({nullable: false, type: 'boolean', default: false})
    publicado: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.publicaciones, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    usuario: Usuario;

    // Relacion 1:M con Like
    @OneToMany(() => Like, like => like.publicacion)
    likes: Like[];

    // Relacion 1:M con Comentario
    @OneToMany(() => Comentario, comentario => comentario.publicacion)
    comentarios: Comentario[];

    // Relacion M:1 con TipoPublicacion
    @ManyToOne(() => TipoPublicacion, tipo => tipo.publicaciones, {onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    tipo: TipoPublicacion;

    // Relacion M:N con subcategorias
    @ManyToMany(() => Subcategoria, subcategoria => subcategoria.publicaciones, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinTable({name: 'publicacion_subcategoria'})
    subcategorias: Subcategoria[];

    // Relacion M:N con subespecialidades
    @ManyToMany(() => Subespecialidad, subespecialidad => subespecialidad.publicaciones, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinTable({name: 'publicacion_subespecialidad'})
    subespecialidades: Subespecialidad[];

    // Relacion 1:1 con OfertaEmpleo
    @OneToOne(() => OfertaEmpleo, ofertaEmpleo => ofertaEmpleo.publicacion)
    ofertaEmpleo: OfertaEmpleo;

    // Relacion 1:1 con Articulo
    @OneToOne(() => Articulo, articulo => articulo.publicacion)
    articulo: Articulo;

    // Relacion 1:1 con Archivo
    @OneToOne(() => Archivo, archivo => archivo.publicacion)
    archivo: Archivo;

    // Relacion 1:1 con Activo
    @OneToOne(() => Activo, activo => activo.publicacion)
    activo: Activo;
}
