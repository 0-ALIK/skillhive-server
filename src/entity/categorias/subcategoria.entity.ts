import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Categoria } from "./categoria.entity";
import { Publicacion } from "../publicaciones/publicacion.entity";
import { Comision } from "../comisiones/comision.entity";

@Entity()
export class Subcategoria {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 50})
    nombre: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion M:1 con Categoria
    @ManyToOne(() => Categoria, categoria => categoria.subcategorias)
    categoria: Categoria;

    // Relacion M:N con publicaciones
    @ManyToMany(() => Publicacion, publicacion => publicacion.subcategorias)
    publicaciones: Publicacion[];

    // Relacion M:N con comisiones
    @ManyToMany(() => Comision, comision => comision.subcategorias)
    comisiones: Comision[];
}