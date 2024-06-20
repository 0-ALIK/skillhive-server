import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany, BaseEntity} from 'typeorm';
import { Especialidad } from './especialidad.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Publicacion } from '../publicaciones/publicacion.entity';

@Entity()
export class Subespecialidad extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50, nullable: false}) 
    nombre: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    // Relacion 1:N con Especialidad
    @ManyToOne(() => Especialidad, especialidad => especialidad.subespecialidades)
    especialidad: Especialidad;

    // Relacion N:M con Usuario
    @ManyToMany(() => Usuario, usuario => usuario.subespecialidades)
    usuarios: Usuario[];

    // Relacion N:M con Publicacion
    @ManyToMany(() => Publicacion, publicacion => publicacion.subespecialidades)
    publicaciones: Publicacion[];
}