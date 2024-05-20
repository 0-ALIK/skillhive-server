import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Seccion } from "./seccion.entity";

@Entity('texto_seccion')
export class TextoSeccion extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: 'text'})
    texto: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:1 con Seccion
    @OneToOne(() => Seccion, seccion => seccion.textoSeccion)
    @JoinColumn()
    @Unique(['seccion'])
    seccion: Seccion;
}
