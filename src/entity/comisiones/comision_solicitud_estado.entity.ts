import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ComisionSolicitud } from "./comision_solicitud.entity";

@Entity()
export class ComisionSolicitudEstado {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    estado: string;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    // Relacion 1:N con ComisionSolicitud
    @OneToMany(() => ComisionSolicitud, solicitud => solicitud.estado)
    solicitudes: ComisionSolicitud[];
}