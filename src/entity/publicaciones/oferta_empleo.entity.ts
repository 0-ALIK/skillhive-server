import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Publicacion } from "./publicacion.entity";
import { OfertaEmpleoTipo } from "./oferta_empleo_tipo.entity";
import { OfertaEmpleoNivel } from "./oferta_empleo_nivel.entity";
import { EmpleoPostulante } from "./empleo_postulante.entity";

@Entity('oferta_empleo')
export class OfertaEmpleo extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: 'text'})
    descripcion: string; 

    @Column({nullable: false})
    vacantes: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relación 1:1 con Publicacion
    @OneToOne(() => Publicacion, publicacion => publicacion.ofertaEmpleo)
    @JoinColumn()
    publicacion: Publicacion;

    // Relacion M:1 con OfertaEmpleoTipo
    @ManyToOne(() => OfertaEmpleoTipo, tipo => tipo.ofertasEmpleo)
    tipo: OfertaEmpleoTipo;

    // Relacion M:1 con OfertaEmpleoNivel
    @ManyToOne(() => OfertaEmpleoNivel, nivel => nivel.ofertasEmpleo)
    nivel: OfertaEmpleoNivel;

    // Relacion 1:M con EmpleoPostulante
    @OneToMany(() => EmpleoPostulante, postulante => postulante.ofertaEmpleo)
    postulantes: EmpleoPostulante[];
}

