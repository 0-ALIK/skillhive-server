import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Publicacion } from "./publicacion.entity";

@Entity('tipo_publicacion')
export class TipoPublicacion {

    @PrimaryColumn()
    id: string;

    @Column()
    tipo: string;

    @Column({ type: 'timestamp'})
    createdAt: Date;

    @Column({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion 1:M con Publicacion
    @OneToMany(() => Publicacion, publicacion => publicacion.tipo)
    publicaciones: Publicacion[];

}