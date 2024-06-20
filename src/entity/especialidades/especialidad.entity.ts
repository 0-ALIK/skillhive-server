import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany, BaseEntity } from 'typeorm';
import { Subespecialidad } from './subespecialidad.entity';

@Entity()
export class Especialidad extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50, nullable: false}) 
    nombre: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:N con Subespecialidad
    @OneToMany(() => Subespecialidad, subespecialidad => subespecialidad.especialidad)
    subespecialidades: Subespecialidad[];
}