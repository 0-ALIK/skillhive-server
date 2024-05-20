import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ComisionSolicitud } from "./comision_solicitud.entity";

@Entity()
export class ComisionSolicitudEstado extends BaseEntity {
    
    @PrimaryColumn({length: '3'})
    id: string;

    @Column({nullable: false, length: '20'})
    estado: string;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:N con ComisionSolicitud
    @OneToMany(() => ComisionSolicitud, solicitud => solicitud.estado)
    solicitudes: ComisionSolicitud[];
}