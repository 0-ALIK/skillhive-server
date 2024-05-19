import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Subespecialidad } from './subespecialidad.entity';

@Entity()
export class Especialidad {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100, nullable: false}) 
    nombre: string;

    @CreateDateColumn({type: 'timestamp', name: 'created_at'})
    created_at: Date;

    @UpdateDateColumn({type: 'timestamp', name: 'updated_at'})
    updated_at: Date;

    // Relacion 1:N con Subespecialidad
    @OneToMany(() => Subespecialidad, subespecialidad => subespecialidad.especialidad)
    subespecialidades: Subespecialidad[];
}