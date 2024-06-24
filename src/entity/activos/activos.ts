import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Publicacion } from "../publicaciones/publicacion.entity";
import { Carrito } from "./carrito";
import { VentasCompras } from "./ventas_compras";
import { ActivoArchivos } from "./activos_archivos";

@Entity()
export class Activo extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, default: false})
    aprobado: boolean;

    @Column({nullable: false, default: false})
    enRevision: boolean;

    @Column({nullable: false, type: 'decimal', precision: 10, scale: 2})
    precio: number;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:1 con Publicacion
    @OneToOne(() => Publicacion, publicacion => publicacion.activo, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    @JoinColumn()
    publicacion: Publicacion;

    // Relacion 1:M con Carrito
    @OneToMany(() => Carrito, carrito => carrito.activo)
    carritos: Carrito[];

    // Relacion 1:M con VentasCompras
    @OneToMany(() => VentasCompras, ventasCompras => ventasCompras.activo)
    ventasCompras: VentasCompras[];

    // Relacion 1:M con ActivoArchivos
    @OneToMany(() => ActivoArchivos, activoArchivos => activoArchivos.activo)
    archivos: ActivoArchivos[];
}