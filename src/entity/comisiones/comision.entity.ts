import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Subcategoria } from "../categorias/subcategoria.entity";
import { ComisionImagenesEjemplo } from "./comision_imagenes_ejemplo.entity";
import { ComisionSolicitud } from "./comision_solicitud.entity";

@Entity()
export class Comision extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: '100'})
    titulo: string;

    @Column({nullable: false, type: 'text'})
    descripcion: string;

    @Column({nullable: false, type: 'decimal', precision: 10, scale: 2})
    precio: number;

    @Column({nullable: false})
    imagen: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion N:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.comisiones)
    usuario: Usuario;

    // Relacion N:M con subcategoria
    @ManyToMany(() => Subcategoria, subcategoria => subcategoria.comisiones)
    @JoinTable({name: 'comision_subcategoria'})
    subcategorias: Subcategoria[];

    // Relacion 1:N con ComisionImagenesEjemplo
    @OneToMany(() => ComisionImagenesEjemplo, imagen => imagen.comision)
    imagenes: ComisionImagenesEjemplo[];

    // Relacion 1:N con ComisionSolicitud
    @OneToMany(() => ComisionSolicitud, solicitud => solicitud.comision)
    comisionesSolicitadas: ComisionSolicitud[];
}