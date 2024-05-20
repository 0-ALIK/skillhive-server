import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comision } from "./comision.entity";

@Entity('comision_imagenes_ejemplo')
export class ComisionImagenesEjemplo extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    imagen: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion N:1 con Comision
    @ManyToOne(() => Comision, comision => comision.imagenes)
    comision: Comision;
}