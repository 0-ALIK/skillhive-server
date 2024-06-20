import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Seccion } from "./seccion.entity";

@Entity('archivos_seccion')
export class ArchivosSeccion extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({nullable: false})
    archivo: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion M:1 con Seccion
    @ManyToOne(() => Seccion, seccion => seccion.archivosSeccion, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    seccion: Seccion;
}