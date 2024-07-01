import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Freelancer } from "./freelancer.entity";
import { Empresa } from "./empresa.entity";
import { Subespecialidad } from "../especialidades/subespecialidad.entity";
import { Seguidores } from "./seguidores.entity";
import { Publicacion } from "../publicaciones/publicacion.entity";
import { Like } from "../publicaciones/like.entity";
import { Comentario } from "../publicaciones/comentario.entity";
import { Ganancia } from "../transacciones/ganancia.entity";
import { Pago } from "../transacciones/pago.entity";
import { Seccion } from "../secciones/seccion.entity";
import { Comision } from "../comisiones/comision.entity";
import { ComisionSolicitud } from "../comisiones/comision_solicitud.entity";
import { EmpleoPostulante } from "../publicaciones/empleo_postulante.entity";
import { Carrito } from "../activos/carrito";
import { VentasCompras } from "../activos/ventas_compras";

export enum TipoUsuario {
    ADMINISTRADOR = 'ADMINISTRADOR',
    FREELANCER = 'FREELANCER',
    EMPRESA = 'EMPRESA'
}

@Entity()
export class Usuario extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, nullable: false})
    correo: string;

    @Column({nullable: false})
    password: string;

    @Column({nullable: false, length: 100})
    nombre: string;

    @Column({nullable: true})
    foto: string;

    @Column({nullable: true})
    banner: string;

    @Column({nullable: true})
    fondo: string;

    @Column({nullable: true})
    about: string;

    @Column({length: 20})
    telefono: string;

    @Column({default: false, nullable: false})
    confirmado: boolean;

    @Column({nullable: true})
    codigoVerificacion: string;

    @Column({ type: 'enum', enum: TipoUsuario, default: TipoUsuario.FREELANCER, nullable: false})
    tipo: TipoUsuario;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
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

    // Relacion 1:N con Seccion
    @OneToMany(() => Seccion, seccion => seccion.usuario)
    secciones: Seccion[];
    
    // Relacion 1:N con Comision
    @OneToMany(() => Comision, comision => comision.usuario)
    comisiones: Comision[];

    // Relacion 1:N con Comision_solicitud (Solicitadas)
    @OneToMany(()=> ComisionSolicitud, comisionSolicitud => comisionSolicitud.usuario)
    comisionesSolicitadas: ComisionSolicitud[];

    // Relacion 1:N con EmpleoPostulante
    @OneToMany(() => EmpleoPostulante, empleoPostulante => empleoPostulante.usuario)
    empleosPostulados: EmpleoPostulante[];

    // Relacion 1:N con carrito
    @OneToMany(() => Carrito, carrito => carrito.usuario)
    carritos: Carrito[];

    // Relacion 1:N con ventasCompras
    @OneToMany(() => VentasCompras, ventasCompras => ventasCompras.usuario)
    ventasCompras: VentasCompras[];
}