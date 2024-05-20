import { BaseEntity, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../usuarios/usuario.entity";
import { OfertaEmpleo } from "./oferta_empleo.entity";

@Entity('empleo_postulante')
export class EmpleoPostulante extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion M:1 con Usuario
    @ManyToOne(() => Usuario, usuario => usuario.empleosPostulados)
    usuario: Usuario;

    // Relacion M:1 con OfertaEmpleo
    @ManyToOne(() => OfertaEmpleo, ofertaEmpleo => ofertaEmpleo.postulantes)
    ofertaEmpleo: OfertaEmpleo;
}