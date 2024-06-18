import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { TipoTransaccion } from "./tipo_transaccion.entity";
import { ComisionSolicitud } from "../comisiones/comision_solicitud.entity";
import { VentasCompras } from "../activos/ventas_compras";

@Entity()
export class Pago extends BaseEntity {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: 'decimal', precision: 10, scale: 2})
    cantidad: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.ganancias)
    usuario: Usuario;   

    // Relacion M:1 con TipoTransaccion
    @ManyToOne(() => TipoTransaccion, tipo => tipo.pagos)
    tipo: TipoTransaccion;

    // relacion 1:1 con ComisionSolicitud
    @OneToOne(() => ComisionSolicitud, comisionSolicitud => comisionSolicitud.pago)
    comisionSolicitud: ComisionSolicitud;

    // relacion 1:1 con VentasCompras
    @OneToOne(() => VentasCompras, ventasCompras => ventasCompras.pago)
    ventasCompras: VentasCompras;
}