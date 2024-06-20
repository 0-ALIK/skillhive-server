import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Seccion } from "./seccion.entity";

export enum TipoSeccionEnum {
    PROYECTOS = 'PRO',
    GALERIA = 'GAL',
    TEXTO = 'TEX'
};

@Entity('tipo_seccion')
export class TipoSeccion extends BaseEntity {

    @PrimaryColumn({length: '3'})
    id: string;

    @Column({nullable: false, length: 20})
    nombre: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:M con Seccion
    @OneToMany(() => Seccion, seccion => seccion.tipoSeccion)
    secciones: Seccion[];
}