import { BaseEntity, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { Activo } from "./activos";
import { Pago } from "../transacciones/pago.entity";
import { Ganancia } from "../transacciones/ganancia.entity";


@Entity('ventas_compras')
export class VentasCompras extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:M con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.ventasCompras)
    usuario: Usuario;

    // Relacion 1:M con Activo
    @ManyToOne(() => Activo, activo => activo.ventasCompras)
    activo: Activo;

    // Relacion 1:1 con Pago
    @OneToOne(() => Pago, pago => pago.ventasCompras)
    @JoinColumn()
    pago: Pago;

    // Relacion 1:1 con Ganancia
    @OneToOne(() => Ganancia, ganancia => ganancia.ventasCompras)
    @JoinColumn()
    ganancia: Ganancia;
}