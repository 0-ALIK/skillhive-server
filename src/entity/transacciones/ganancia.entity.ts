import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { TipoTransaccion } from "./tipo_transaccion.entity";
import { ComisionSolicitud } from "../comisiones/comision_solicitud.entity";

@Entity()
export class Ganancia extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: 'decimal', precision: 10, scale: 2})
    cantidad: number;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;
    
    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.ganancias)
    usuario: Usuario;

    // Relacion M:1 con TipoTransaccion
    @ManyToOne(() => TipoTransaccion, tipo => tipo.ganancias)
    tipo: TipoTransaccion;

    // Relacion 1:1 con ComisionSolicitud
    @OneToOne(()=> ComisionSolicitud, comisionSolicitud => comisionSolicitud.ganancia)
    comisionSolicitud: ComisionSolicitud;
}