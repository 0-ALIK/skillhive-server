/*
Proyectos_seccion
id (pk autoincremental)
seccion_id
nombre
descripcion
imagen
enlace
fecha_inicio
fecha_fin
created_at
updated_at
*/
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Seccion } from "./seccion.entity";

@Entity('proyectos_seccion')
export class ProyectosSeccion {
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

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    // Relacion M:1 con Seccion
    @ManyToOne(() => Seccion, seccion => seccion.proyectosSeccion)
    seccion: Seccion;
}