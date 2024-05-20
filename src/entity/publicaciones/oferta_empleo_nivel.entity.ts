import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OfertaEmpleo } from "./oferta_empleo.entity";

@Entity('oferta_empleo_nivel')
export class OfertaEmpleoNivel extends BaseEntity {

    @PrimaryColumn({length: 3})
    id: string;   

    @Column({nullable: false, length: 20})
    nivel: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:M con OfertaEmpleo
    @OneToMany(() => OfertaEmpleo, ofertaEmpleo => ofertaEmpleo.tipo)
    ofertasEmpleo: OfertaEmpleo[];
}