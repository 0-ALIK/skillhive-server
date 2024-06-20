import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Publicacion } from "./publicacion.entity";

export enum TipoPublicacionEnum {
    ARTICULO = 'ART',
    ACTIVO = 'ACT',
    MULTIMEDIOS = 'MUL',
    EMPLEO = 'EMP'
};

@Entity('tipo_publicacion')
export class TipoPublicacion extends BaseEntity {

    @PrimaryColumn({length: '3'})
    id: string;

    @Column({nullable: false, length: '20'})
    tipo: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:M con Publicacion
    @OneToMany(() => Publicacion, publicacion => publicacion.tipo)
    publicaciones: Publicacion[];

}