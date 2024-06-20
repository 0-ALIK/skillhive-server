import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Activo } from "./activos";

@Entity()
export class ActivoArchivos extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    archivo: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:M con Activo
    @ManyToOne(() => Activo, activo => activo.archivos, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    activo: Activo;
}