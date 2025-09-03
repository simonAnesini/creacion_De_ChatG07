'use client'
import styles from "@/componentes/Boton.module.css"
import clsx from "clsx"

export default function Boton(props) {
    return(
    <>
        <button className={
            clsx(
            {
                [styles.estilos]: true,
            }
        )} onClick={props.onClick}>{props.text}</button>
    </>
    )
}