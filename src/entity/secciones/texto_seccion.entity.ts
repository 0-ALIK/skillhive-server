import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Seccion } from "./seccion.entity";

@Entity('texto_seccion')
export class TextoSeccion {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, type: 'text'})
    texto: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion 1:1 con Seccion
    @OneToOne(() => Seccion, seccion => seccion.textoSeccion)
    @JoinColumn()
    @Unique(['seccion'])
    seccion: Seccion;
}
