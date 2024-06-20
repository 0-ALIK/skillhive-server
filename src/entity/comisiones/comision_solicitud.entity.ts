import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Comision } from "./comision.entity";
import { Pago } from "../transacciones/pago.entity";
import { Ganancia } from "../transacciones/ganancia.entity";
import { ComisionSolicitudEstado } from "./comision_solicitud_estado.entity";
import { ComisionSolicitudEntregables } from "./comision_solicitud_entregables.entity";

@Entity()
export class ComisionSolicitud extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({nullable: false, type: 'text'})
    descripcion: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion N:1 con comision
    @ManyToOne(() => Comision, comision => comision.comisionesSolicitadas, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    comision: Comision;

    // Relacion N:1 con Usuario (Solicitante)
    @ManyToOne(() => Usuario, usuario => usuario.comisionesSolicitadas, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    usuario: Usuario;

    // Relacion 1:1 con pago
    @OneToOne(() => Pago, pago => pago.comisionSolicitud, {onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    @JoinColumn()
    pago: Pago;

    // relacion 1:1 con ganancia
    @OneToOne(() => Ganancia, ganancia => ganancia.comisionSolicitud, {onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    @JoinColumn()
    ganancia: Ganancia;

    // Relacion N:1 con ComisionSolicitudEstado
    @ManyToOne(() => ComisionSolicitudEstado, estado => estado.solicitudes, {onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    estado: ComisionSolicitudEstado;

    // Relacion 1:N con ComisionSolicitudEntregables
    @OneToMany(() => ComisionSolicitudEntregables, entregable => entregable.solicitud)
    entregables: ComisionSolicitudEntregables[];
}