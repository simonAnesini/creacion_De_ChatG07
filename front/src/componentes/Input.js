'use client'
import styles from "@/componentes/Input.module.css"
import clsx from "clsx"

export default function Input(props){
    return(
<>
    <input className={
        clsx(
            {[styles.estilosLogin]: props.tipo== "login"}
        )

    } type={props.type} onChange={props.onChange} placeholder={props.placeholder}/>
</>
)
}