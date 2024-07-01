import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Pago } from "./pago.entity";
import { Ganancia } from "./ganancia.entity";

export enum TipoTransaccionEnum {
    PAGO_SERVICIO = 'SCS',
    COMPRA_ACTIVOS = 'CDA',
    PAGO_MEMBRESIA = 'PDM',
    OTRO = 'OTR'
};

@Entity('tipo_transaccion')
export class TipoTransaccion extends BaseEntity {

    @PrimaryColumn({length: '3'})
    id: string;

    @Column({nullable: false, length: '20'})
    tipo: string;

    @UpdateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:M con Pago
    @OneToMany(() => Pago, pago => pago.tipo)
    pagos: Pago[];

    // Relacion 1:M con Ganancia
    @OneToMany(() => Ganancia, ganancia => ganancia.tipo)
    ganancias: Ganancia[];
}
