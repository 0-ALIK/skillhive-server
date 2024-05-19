import { Column, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Pago } from "./pago.entity";
import { Ganancia } from "./ganancia.enitity";

@Entity('tipo_transaccion')
export class TipoTransaccion {

    @PrimaryColumn()
    id: string;

    @Column({nullable: false})
    tipo: string;

    @UpdateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion 1:M con Pago
    @OneToMany(() => Pago, pago => pago.tipo)
    pagos: Pago[];

    // Relacion 1:M con Ganancia
    @OneToMany(() => Ganancia, ganancia => ganancia.tipo)
    ganancias: Ganancia[];
}
