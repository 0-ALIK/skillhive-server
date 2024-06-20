import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Seccion } from "./seccion.entity";

@Entity('proyectos_seccion')
export class ProyectosSeccion extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 100})
    nombre: string;

    @Column({nullable: false, length: 200})
    descripcion: string;

    @Column({nullable: false})
    imagen: string;

    @Column({nullable: false})
    enlace: string;

    @Column({nullable: false})
    fecha_inicio: Date;

    @Column({nullable: false})
    fecha_fin: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion M:1 con Seccion
    @ManyToOne(() => Seccion, seccion => seccion.proyectosSeccion, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    seccion: Seccion;
}