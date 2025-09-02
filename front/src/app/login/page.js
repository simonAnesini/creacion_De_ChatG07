'use client'
import Boton from "@/componentes/Boton";
import Input from "@/componentes/Input";
import { useEffect, useState } from "react";

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
    
    if (nuevoUsuario){} 

    return (
        <>
            <Input onChange={modificarNombre}></Input>
            <Input onChange={modificarContraseña}></Input>
            <Input onChange={modificarNumero}></Input>
            <h2> ¿eres nuevo?</h2>
            <input type="checkbox" onChange={checkboxActivado}/>
            <h2>{nombre}</h2>
            <h2>{contraseña}</h2>
            <h2>{numero}</h2>
            <Boton text="HOLA"></Boton>
        </>

    )
}