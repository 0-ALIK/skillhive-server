import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Freelancer } from "./freelancer.entity";
import { Empresa } from "./empresa.entity";
import { Subespecialidad } from "../especialidades/subespecialidad.entity";
import { Seguidores } from "./seguidores.entity";
import { Publicacion } from "../publicaciones/publicacion.entity";
import { Like } from "../publicaciones/like.entity";
import { Comentario } from "../publicaciones/comentario.entity";
import { Ganancia } from "../activos/ganancia.enitity";
import { Pago } from "../activos/pago.entity";

enum TipoUsuario {
    ADMINISTRADOR = 'ADMINISTRADOR',
    FREELANCER = 'FREELANCER',
    EMPRESA = 'EMPRESA'
}

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, nullable: false})
    correo: string;

    @Column({nullable: false, select: false})
    password: string;

    @Column({nullable: false})
    nombre: string;

    @Column()
    foto: string;

    @Column()
    banner: string;

    @Column()
    fondo: string;

    @Column()
    about: string;

    @Column({length: 20})
    telefono: string;

    @Column({ type: 'enum', enum: TipoUsuario, default: TipoUsuario.FREELANCER, nullable: false})
    tipo: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    // Relacion 1:1 con Freelancer
    @OneToOne(() => Freelancer, freelancer => freelancer.usuario)
    freelancer: Freelancer;

    // Relacion 1:1 con Empresa
    @OneToOne(() => Empresa, empresa => empresa.usuario)
    empresa: Empresa;

    // Relacion N:M con Subespecialidad
    @ManyToMany(() => Subespecialidad, subespecialidad => subespecialidad.usuarios)
    @JoinTable({name: 'usuario_subespecialidad'})
    subespecialidades: Subespecialidad[];

    // Relacion N:M con Usuario (Seguidores)
    @OneToOne(() => Seguidores, seguidores => seguidores.seguidor)
    seguidores: Seguidores;

    // Relacion N:M con Usuario (Seguidos)
    @OneToOne(() => Seguidores, seguidores => seguidores.seguido)
    seguidos: Seguidores;

    // Relacion 1:N con Publicacion
    @OneToMany(() => Publicacion, publicacion => publicacion.usuario)
    publicaciones: Publicacion[];

    // Relacion 1:N con Like
    @OneToMany(() => Like, like => like.usuario)
    likes: Like[];

    // Relacion 1:N con Comentario
    @OneToMany(() => Comentario, comentario => comentario.usuario)
    comentarios: Comentario[];

    // Relacion 1:N con Ganancia
    @OneToMany(() => Ganancia, ganancia => ganancia.usuario)
    ganancias: Ganancia[];

    // Relacion 1:N con Pago
    @OneToMany(() => Pago, pago => pago.usuario)
    pagos: Pago[];
}