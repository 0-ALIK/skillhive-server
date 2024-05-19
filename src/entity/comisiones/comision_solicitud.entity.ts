import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Comision } from "./comision.entity";
import { Pago } from "../activos/pago.entity";
import { Ganancia } from "../activos/ganancia.enitity";
import { ComisionSolicitudEstado } from "./comision_solicitud_estado.entity";
import { ComisionSolicitudEntregables } from "./comision_solicitud_entregables.entity";

@Entity()
export class ComisionSolicitud {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({nullable: false})
    descripcion: string;

    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;

    // Relacion N:1 con comision
    @ManyToOne(() => Comision, comision => comision.comisionesSolicitadas)
    comision: Comision;

    // Relacion N:1 con Usuario (Solicitante)
    @ManyToOne(() => Usuario, usuario => usuario.comisionesSolicitadas)
    usuario: Usuario;

    // Relacion 1:1 con pago
    @OneToOne(() => Pago, pago => pago.comisionSolicitud)
    @JoinColumn()
    pago: Pago;

    // relacion 1:1 con ganancia
    @OneToOne(() => Ganancia, ganancia => ganancia.comisionSolicitud)
    @JoinColumn()
    ganancia: Ganancia;

    // Relacion N:1 con ComisionSolicitudEstado
    @ManyToOne(() => ComisionSolicitudEstado, estado => estado.solicitudes)
    estado: ComisionSolicitudEstado;

    // Relacion 1:N con ComisionSolicitudEntregables
    @OneToMany(() => ComisionSolicitudEntregables, entregable => entregable.solicitud)
    entregables: ComisionSolicitudEntregables[];
}