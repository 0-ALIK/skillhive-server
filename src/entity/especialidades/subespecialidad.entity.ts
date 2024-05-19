import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany} from 'typeorm';
import { Especialidad } from './especialidad.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Publicacion } from '../publicaciones/publicacion.entity';

@Entity()
export class Subespecialidad {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100, nullable: false}) 
    nombre: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
    
    // Relacion 1:N con Especialidad
    @ManyToOne(() => Especialidad, especialidad => especialidad.subespecialidades, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    especialidad: Especialidad;

    // Relacion N:M con Usuario
    @ManyToMany(() => Usuario, usuario => usuario.subespecialidades)
    usuarios: Usuario[];

    // Relacion N:M con Publicacion
    @ManyToMany(() => Publicacion, publicacion => publicacion.subespecialidades)
    publicaciones: Publicacion[];
}