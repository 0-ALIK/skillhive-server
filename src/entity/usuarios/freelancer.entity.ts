import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Usuario } from "./usuario.entity";

@Entity()
export class Freelancer extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false, length: 50})
    apellido: string;

    @Column({nullable: false, length: 20})
    cedula: string;

    @Column({nullable: false})
    fecha_nacimiento: Date;

    @Column()
    fondo: string;

    @Column({nullable: false, default: false})
    open_comissions: boolean;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relacion 1:1 con Usuario
    @OneToOne(() => Usuario, usuario => usuario.freelancer, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    @Unique(['usuario'])
    usuario: Usuario;
}