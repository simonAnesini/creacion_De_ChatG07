"use client";
import Boton from "@/componentes/Boton";
import Input from "@/componentes/Input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/login/page.module.css";
import { useRouter } from "next/navigation";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
<<<<<<< Updated upstream
  const [numero, setNumero] = useState(0);
  const [nuevoUsuario, setNuevo] = useState(false);
  const [id, setId] = useState("");
  const router = useRouter();

  const irAChat = () => {
    router.push("/chat");
  };
=======
  const [numero, setNumero] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
>>>>>>> Stashed changes

  // Handlers para los inputs
  function modificarNombre(event) {
    setNombre(event.target.value);
  }
  function modificarContraseña(event) {
    setContraseña(event.target.value);
  }
  function modificarNumero(event) {
    setNumero(event.target.value);
  }

<<<<<<< Updated upstream
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
=======
  // LOGIN
  async function handleLogin() {
    setError("");
    if (!nombre || !contraseña || !numero) {
      setError("Completa todos los campos.");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: numero,
          contraseña: contraseña,
          nombre: nombre
        })
      });
      const data = await res.json();
      if (data.login) {
        router.push("/chat");
      } else {
        setError(data.message || "Usuario o contraseña incorrectos.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    }
  }

  // REGISTRO
  async function handleRegister() {
    setError("");
    if (!nombre || !contraseña || !numero) {
      setError("Completa todos los campos.");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: numero,
          contraseña: contraseña,
          nombre: nombre
        })
      });
      const data = await res.json();
      if (data.login) {
        router.push("/chat");
      } else {
        setError(data.message || "No se pudo registrar el usuario.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    }
  }

  return (
    <div className={styles.todo}>
      <div className={styles.container} style={{ flexDirection: "row", gap: "24px", alignItems: "stretch" }}>
        {/* Login */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 className={styles.header}>Iniciar Sesión</h1>
          <Input tipo="login" placeholder="Nombre" onChange={modificarNombre} value={nombre} />
          <Input tipo="login" placeholder="Contraseña" onChange={modificarContraseña} value={contraseña} />
          <Input tipo="login" placeholder="Número" onChange={modificarNumero} value={numero} />
          <Boton text="INGRESAR" tipo="login" onClick={handleLogin} />
        </div>
        {/* Nombre de la app */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 120 }}>
          <span style={{ fontSize: 32, fontWeight: "bold", color: "#467f39" }}>APPChats</span>
        </div>
        {/* Registro */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 className={styles.header}>Registrarse</h1>
          <Input tipo="login" placeholder="Nombre" onChange={modificarNombre} value={nombre} />
          <Input tipo="login" placeholder="Contraseña" onChange={modificarContraseña} value={contraseña} />
          <Input tipo="login" placeholder="Número" onChange={modificarNumero} value={numero} />
          <Boton text="REGISTRARME" tipo="login" onClick={handleRegister} />
        </div>
      </div>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {error && <span style={{ color: "red", fontWeight: "bold" }}>{error}</span>}
      </div>
    </div>
>>>>>>> Stashed changes
  );
}