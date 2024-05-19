import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Categoria } from "./categoria.entity";

@Entity()
export class Subcategoria {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 50})
    nombre: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion M:1 con Categoria
    @ManyToOne(() => Categoria, categoria => categoria.subcategorias)
    categoria: Categoria;
}