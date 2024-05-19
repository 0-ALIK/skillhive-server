import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Usuario } from "./usuario.entity";

@Entity()
export class Empresa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    ruc: string;

    @Column({nullable: false})
    razon_social: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    // Relacion 1:1 con Usuario
    @OneToOne(() => Usuario, usuario => usuario.empresa, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @Unique(['usuario'])
    usuario: Usuario;

}