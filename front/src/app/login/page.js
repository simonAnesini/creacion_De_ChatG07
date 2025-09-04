'use client'
import Boton from "@/componentes/Boton";
import Input from "@/componentes/Input";
import { useEffect, useState } from "react";
import styles from "@/app/login/page.module.css"

export default function Login() {
    const [nombre, setNombre] = useState("")
    const [contraseña, setContraseña] = useState("")
    const [numero, setNumero] = useState(0)
    const [nuevoUsuario, setNuevo] = useState(false)

    function modificarNombre(event) {
        setNombre(event.target.value)
    }

    function modificarContraseña(event) {
        setContraseña(event.target.value)
    }

    function modificarNumero(event) {
        setNumero(event.target.value)
    }

    function checkboxActivado(event) {
        console.log(event.target.checked)
        setNuevo(event.target.checked)
    }

    useEffect(() => {
        console.log(nombre)
    }, [nombre])

    useEffect(() => {
        console.log(contraseña)
    }, [contraseña])
    
    if (nuevoUsuario){

    } 

    return (
        <div className={styles.todo}> 
            <h1>Iniciar Sesión</h1>
            <h2>nombre</h2>
            <Input onChange={modificarNombre}></Input>
            <h2>contraseña</h2>
            <Input onChange={modificarContraseña}></Input>
            <h2>número</h2>
            <Input onChange={modificarNumero}></Input>
            <h2> ¿eres nuevo?</h2>
            <input type="checkbox" onChange={checkboxActivado}/>
            <h2>{nombre}</h2>
            <h2>{contraseña}</h2>
            <h2>{numero}</h2>
            <Boton text="HOLA" tipo="login"></Boton>
        </div>

    )
}