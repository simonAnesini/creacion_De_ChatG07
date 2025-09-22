'use client'
import styles from "@/componentes/Grupo.module.css"
import clsx from "clsx"

export default function Grupo(props){
    return (
        <div className={clsx(
            {
                [styles.estilosGrupo] : props.tipo,
            })}>
            <img src={props.imagen} alt="Imagen del grupo" />
            <h2>Grupo: {props.nombre}</h2>
        </div>
    );
}
