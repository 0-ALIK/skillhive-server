import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Publicacion } from "./publicacion.entity";

@Entity()
export class Articulo extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({nullable: false, type: 'longtext'})
    contenido: string;
  
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:1 con Publicacion
    @OneToOne(() => Publicacion, publicacion => publicacion.articulo, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn()
    publicacion: Publicacion;

}