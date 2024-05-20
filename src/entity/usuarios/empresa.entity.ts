import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Usuario } from "./usuario.entity";

@Entity()
export class Empresa extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, unique: true, length: 20})
    ruc: string;

    @Column({nullable: false, length: 100})
    razon_social: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:1 con Usuario
    @OneToOne(() => Usuario, usuario => usuario.empresa, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    @Unique(['usuario'])
    usuario: Usuario;

}