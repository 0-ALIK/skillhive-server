import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Subcategoria } from "./subcategoria.entity";

@Entity()
export class Categoria extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 50})
    nombre: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:M con Subcategoria
    @OneToMany(() => Subcategoria, subcategoria => subcategoria.categoria)
    subcategorias: Subcategoria[];

}