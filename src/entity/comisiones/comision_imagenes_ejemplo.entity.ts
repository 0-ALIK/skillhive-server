import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comision } from "./comision.entity";

@Entity('comision_imagenes_ejemplo')
export class ComisionImagenesEjemplo {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    imagen: string;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    // Relacion N:1 con Comision
    @ManyToOne(() => Comision, comision => comision.imagenes)
    comision: Comision;
}