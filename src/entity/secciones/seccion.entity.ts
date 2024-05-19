import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TipoSeccion } from "./tipo_seccion.entity";
import { TextoSeccion } from "./texto_seccion.entity";
import { ProyectosSeccion } from "./proyectos_seccion.entity";
import { ArchivosSeccion } from "./archivos_seccion";
import { Usuario } from "../usuarios/usuario.entity";

@Entity()
export class Seccion {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    orden: number;

    @Column({nullable: false, length: 50})
    titulo: string;

    @CreateDateColumn({ type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updatedAt: Date;

    // Relacion M:1 con TipoSeccion
    @ManyToOne(() => TipoSeccion, tipoSeccion => tipoSeccion.secciones)
    tipoSeccion: TipoSeccion;

    // Relacion 1:1 con TextoSeccion
    @OneToOne(() => TextoSeccion, textoSeccion => textoSeccion.seccion)
    textoSeccion: TextoSeccion;

    // Relacion 1:M con ProyectosSeccion
    @OneToMany(() => ProyectosSeccion, proyectosSeccion => proyectosSeccion.seccion)
    proyectosSeccion: ProyectosSeccion[];

    // Relacion 1:M con ArchivosSeccion
    @OneToMany(() => ArchivosSeccion, archivosSeccion => archivosSeccion.seccion)
    archivosSeccion: ArchivosSeccion[];

    // Relacion M:1 con usuario
    @ManyToOne(() => Usuario, usuario => usuario.secciones)
    usuario: Usuario;
}
