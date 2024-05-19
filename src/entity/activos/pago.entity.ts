import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { TipoTransaccion } from "./tipo_transaccion.entity";

@Entity()
export class Pago {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    cantidad: number;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;
    
    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.ganancias)
    usuario: Usuario;   

    // Relacion M:1 con TipoTransaccion
    @ManyToOne(() => TipoTransaccion, tipo => tipo.pagos)
    tipo: TipoTransaccion;
}