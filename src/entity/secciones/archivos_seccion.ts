import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Seccion } from "./seccion.entity";

@Entity('archivos_seccion')
export class ArchivosSeccion {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({nullable: false})
    archivo: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion M:1 con Seccion
    @ManyToOne(() => Seccion, seccion => seccion.archivosSeccion)
    seccion: Seccion;
}