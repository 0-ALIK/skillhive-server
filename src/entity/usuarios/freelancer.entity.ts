import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Usuario } from "./usuario.entity";

@Entity()
export class Freelancer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    apellido: string;

    @Column({nullable: false})
    cedula: string;

    @Column({nullable: false})
    fecha_nacimiento: Date;

    @Column()
    fondo: string;

    @Column({nullable: false})
    open_comissions: boolean;
    
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    // Relacion 1:1 con Usuario
    @OneToOne(() => Usuario, usuario => usuario.freelancer, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    @Unique(['usuario'])
    usuario: Usuario;
}