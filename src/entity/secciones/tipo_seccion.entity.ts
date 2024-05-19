import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Seccion } from "./seccion.entity";

@Entity('tipo_seccion')
export class TipoSeccion {

    @PrimaryColumn()
    id: string;

    @Column({nullable: false, length: 50})
    nombre: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion 1:M con Seccion
    @OneToMany(() => Seccion, seccion => seccion.tipoSeccion)
    secciones: Seccion[];
}