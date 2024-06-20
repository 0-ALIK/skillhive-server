import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Publicacion } from "./publicacion.entity";

@Entity()
export class Archivo extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    archivo: string;   

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // relacion 1:1 con Publicacion
    @OneToOne(() => Publicacion, publicacion => publicacion.archivo, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn()
    publicacion: Publicacion;
}