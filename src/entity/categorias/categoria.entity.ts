import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Subcategoria } from "./subcategoria.entity";

@Entity()
export class Categoria {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 50})
    nombre: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion 1:M con Subcategoria
    @OneToMany(() => Subcategoria, subcategoria => subcategoria.categoria)
    subcategorias: Subcategoria[];

}