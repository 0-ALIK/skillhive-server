import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Pago } from "./pago.entity";
import { Ganancia } from "./ganancia.entity";

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
