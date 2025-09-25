"use client";
import Boton from "@/componentes/Boton";
import Input from "@/componentes/Input";
import { useEffect, useState } from "react";
import styles from "@/app/login/page.module.css";
import { useRouter } from "next/navigation";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [numero, setNumero] = useState(0);
  const [nuevoUsuario, setNuevo] = useState(false);
  const [id, setId] = useState("");
  const router = useRouter();

  const irAChat = () => {
    router.push("/chat");
  };

  function modificarNombre(event) {
    setNombre(event.target.value);
  }

  function modificarContraseña(event) {
    setContraseña(event.target.value);
  }

  function modificarNumero(event) {
    setNumero(event.target.value);
  }

  function checkboxActivado(event) {
    setNuevo(event.target.checked);
  }

  async function ingresar() {
    setId(numero);
    
    const datos = {
      nombre: nombre,
      contraseña: contraseña,
      numero: numero,
      nuevoUsuario:nuevoUsuario,
    };

      return fetch(`http://localhost:4000/traerUsuarios`, {
        method: "POST",
        body: JSON.stringify(datos),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((result) => {
          setId(result.numero);
          localStorage.setItem("id", result.numero);
          irAChat();
        });
    
      }

  useEffect(() => {
    console.log(nombre);
  }, [nombre]);

  useEffect(() => {
    console.log(contraseña);
  }, [contraseña]);

  return (
    <>
      <div className={styles.todo}>
        <div className={styles.container}>
          <h1 className={styles.header}>Iniciar Sesión</h1>
          <Input tipo="login" placeholder="Nombre" onChange={modificarNombre}></Input>
          <Input tipo="login" placeholder="Contraseña" onChange={modificarContraseña}></Input>
          <Input tipo="login" placeholder="Número" onChange={modificarNumero}></Input>
          <h2 className={styles.h2}>¿Eres nuevo?</h2>
          <input type="checkbox" onChange={checkboxActivado} />
          <h2>{nombre}</h2>
          <h2>{contraseña}</h2>
          <h2>{numero}</h2>
          <Boton text="INGRESAR" tipo="login" onClick={ingresar}></Boton>
        </div>
      </div>
    </>
  );
}