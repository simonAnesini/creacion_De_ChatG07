"use client";

import Boton from "@/componentes/Boton";
import Input from "@/componentes/Input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [numero, setNumero] = useState("");
  const [foto, setFoto] = useState("");
  const [nuevoUsuario, setNuevo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  function modificarNombre(event) {
    setNombre(event.target.value);
  }

  function modificarContraseña(event) {
    setContraseña(event.target.value);
  }

  function modificarNumero(event) {
    setNumero(event.target.value);
  }

  function modificarFoto(event) {
    setFoto(event.target.value);
  }

  function checkboxActivado(event) {
    setNuevo(event.target.checked);
  }

  async function ingresar() {
    // Registro
    if (nuevoUsuario) {
      if (!nombre || !contraseña || !numero) {
        setMensaje("Completá nombre, contraseña y número para registrarte");
        return;
      }
      const datos = { nombre, contraseña, numero, foto: foto || "" };
      try {
        const res = await fetch("http://localhost:4000/traerUsuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });

        let parsed;
        const text = await res.text();
        try { parsed = JSON.parse(text); } catch { parsed = text; }

        const success =
          (typeof parsed === "object" && (parsed.ok === true || parsed.res === true)) ||
          (typeof parsed === "string" && parsed === numero) ||
          res.status === 200;

        setMensaje((typeof parsed === "object") ? (parsed.message || "Registro ok") : String(parsed));

        if (success) {
          // autologin y redirect a chat
          localStorage.setItem("userNumero", numero);
          localStorage.setItem("userNombre", nombre);
          router.push("/chat"); // tu ruta de chats (ajustá si es /chats)
        }
      } catch (err) {
        console.error(err);
        setMensaje("Error en registro");
      }
      return;
    }

    // Login
    if (!numero || !contraseña) {
      setMensaje("Completá número y contraseña");
      return;
    }

    try {
      const datosLogin = { numero, contraseña };
      const resp = await fetch("http://localhost:4000/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin),
      });
      const result = await resp.json();
      console.log("loginUser:", result);
      if (result.validar === true) {
        localStorage.setItem("userNumero", numero);
        localStorage.setItem("userNombre", result.nombre || nombre || "");
        setMensaje("Login exitoso");
        router.push("/chat");
      } else {
        setMensaje(result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error de conexión al servidor");
    }
  }

  useEffect(() => {
    console.log("nombre:", nombre);
  }, [nombre]);

  useEffect(() => {
    console.log("contraseña:", contraseña);
  }, [contraseña]);

  return (
    <>
      <div className={styles.todo}>
        <div className={styles.container}>
          <h1 className={styles.header}>Iniciar Sesión</h1>

          <Input tipo="login" placeholder="Nombre" value={nombre} onChange={modificarNombre}></Input>
          <Input tipo="login" placeholder="Contraseña" value={contraseña} onChange={modificarContraseña}></Input>
          <Input tipo="login" placeholder="Número" value={numero} onChange={modificarNumero}></Input>

          {nuevoUsuario && (
            <>
              <Input tipo="url" placeholder="URL de foto (opcional)" value={foto} onChange={modificarFoto}></Input>
            </>
          )}

          <div className={styles.row}>
            <h2 className={styles.h2}>¿Eres nuevo?</h2>
            <input type="checkbox" onChange={checkboxActivado} checked={nuevoUsuario} />
          </div>

          <div className={styles.preview}>
            <h3>Preview:</h3>
            <h4>Nombre: {nombre}</h4>
            <h4>Contraseña: {contraseña}</h4>
            <h4>Número: {numero}</h4>
            {nuevoUsuario && <h4>Foto: {foto}</h4>}
          </div>

          {mensaje && <div className={styles.mensaje}>{mensaje}</div>}

          <Boton text="INGRESAR" tipo="login" onClick={ingresar}></Boton>
        </div>
      </div>
    </>
  );
}
