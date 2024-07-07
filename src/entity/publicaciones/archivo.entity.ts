import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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

    // relacion 1:M con Publicacion
    @ManyToOne(() => Publicacion, publicacion => publicacion.archivos, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    publicacion: Publicacion;
}