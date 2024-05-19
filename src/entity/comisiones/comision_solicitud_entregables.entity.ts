import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ComisionSolicitud } from "./comision_solicitud.entity";

@Entity()
export class ComisionSolicitudEntregables {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    archivo: string;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    // relacion N:1 con ComisionSolicitud
    @ManyToOne(() => ComisionSolicitud, solicitud => solicitud.entregables)
    solicitud: ComisionSolicitud;

}   