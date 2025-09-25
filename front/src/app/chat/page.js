"use client";

import React, { useEffect, useRef, useState } from "react";
import Input from "@/componentes/Input";
import Contacto from "@/componentes/Contacto";
import Mensaje from "@/componentes/Mensaje";
import Boton from "@/componentes/Boton";
import Popup from "reactjs-popup";
import io from "socket.io-client";
import styles from "./page.module.css";

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [targetNumero, setTargetNumero] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // inicializar socket
    const socket = io("http://localhost:4000", { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket conectado:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado");
      setIsConnected(false);
    });

    socket.on("newMessage", (data) => {
      // data.message tiene {id_chat, texto, numero, id?}
      console.log("newMessage:", data);
      if (data && data.message) {
        setMensajes((prev) => [...prev, data.message]);
      }
    });

    socket.on("chat-messages", (data) => {
      console.log("chat-messages:", data);
    });

    socket.on("pingAll", (d) => console.log("pingAll:", d));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const numero = localStorage.getItem("userNumero");
    if (!numero) {
      console.warn("No userNumero en localStorage - redirigir al login");
      // no uso next/router aquí (estamos en client), dejá que el usuario acceda
      return;
    }
    cargarChats(numero);
  }, []);

  async function cargarChats(numero) {
    try {
      const resp = await fetch("http://localhost:4000/chatsUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero }),
      });
      const result = await resp.json();
      if (result.success && result.chats) {
        setChats(result.chats);
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error("Error cargarChats:", err);
    }
  }

  const openPopup = () => setPopupOpen(true);
  const closePopup = () => {
    setPopupOpen(false);
    setTargetNumero("");
  };

  async function crearNuevoChat() {
    const userNumero = localStorage.getItem("userNumero");
    if (!targetNumero.trim()) {
      alert("Ingresá el número del usuario");
      return;
    }
    try {
      const resp = await fetch("http://localhost:4000/newChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userNumero, targetNumero: targetNumero.trim() }),
      });
      const result = await resp.json();
      if (result.res === true) {
        alert(result.existing ? "Chat existente" : "Chat creado");
        closePopup();
        cargarChats(userNumero);
        if (result.chatId) {
          // seleccionar nuevo chat
          setTimeout(() => seleccionarChat({ id: result.chatId, nombre: result.chatName || targetNumero }), 200);
        }
      } else {
        alert("Error: " + (result.message || "No se pudo crear chat"));
      }
    } catch (err) {
      console.error("Error crearNuevoChat:", err);
      alert("Error al crear chat");
    }
  }

  async function seleccionarChat(chat) {
    setSelectedChat(chat);
    try {
      const resp = await fetch("http://localhost:4000/chatHistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_chat: chat.id }),
      });
      const result = await resp.json();
      if (result.res === true) {
        setMensajes(result.mensajes || []);
      } else {
        setMensajes([]);
      }

      // unir sala por socket
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("joinRoom", { room: `chat_${chat.id}` });
      }
    } catch (err) {
      console.error("Error seleccionarChat:", err);
    }
  }

  async function enviarMensaje() {
    if (!nuevoMensaje.trim() || !selectedChat) return;
    const numero = localStorage.getItem("userNumero");
    const payload = {
      id_chat: selectedChat.id,
      texto: nuevoMensaje.trim(),
      numero,
    };
    setNuevoMensaje("");
    try {
      // guardar en BD
      await fetch("http://localhost:4000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // emitir por socket para que otros lo reciban
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("sendMessage", payload);
      } else {
        // fallback: agregar local
        setMensajes((prev) => [...prev, payload]);
      }
    } catch (err) {
      console.error("Error enviarMensaje:", err);
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") enviarMensaje();
  }

  const sendPingAll = () => {
    if (socketRef.current && socketRef.current.connected) socketRef.current.emit("pingAll", "Ping desde cliente");
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.top}>
          <h2>Chats</h2>
          <div>
            <Boton text="Nuevo chat" tipo="small" onClick={openPopup} />
            <Boton text={isConnected ? "Ping ✅" : "Ping ❌"} tipo="small" onClick={sendPingAll} />
          </div>
        </div>

        <div className={styles.list}>
          <ul>
            {chats.length === 0 && <li className={styles.empty}>No hay chats</li>}
            {chats.map((c) => (
              <li key={c.id} onClick={() => seleccionarChat(c)}>
                <Contacto chat={c} isSelected={selectedChat && selectedChat.id === c.id} />
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className={styles.chatArea}>
        {selectedChat ? (
          <>
            <div className={styles.headerChat}>
              <h3>{selectedChat.nombre}</h3>
              <span>{isConnected ? "🟢 Online" : "🔴 Offline"}</span>
            </div>

            <div className={styles.messages}>
              {mensajes.length === 0 && <div className={styles.noMessages}>No hay mensajes</div>}
              {mensajes.map((m, idx) => (
                <Mensaje key={idx} texto={m.texto} numero={m.numero} isMine={String(m.numero) === localStorage.getItem("id")> <mensaje/>
              ))}
            </div>

            <div className={styles.inputRow}>
              <Input tipo="chat" placeholder="Escribí un mensaje..." value={nuevoMensaje} onChange={(e) => setNuevoMensaje(e.target.value)} onKeyDown={handleKeyPress} />
              <Boton text="Enviar" onClick={enviarMensaje} />
            </div>
          </>
        ) : (
          <div className={styles.emptySelect}>
            <h3>Seleccioná un chat para comenzar</h3>
            <p>Estado: {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}</p>
          </div>
        )}
      </main>

      <Popup open={isPopupOpen} onClose={closePopup} modal nested>
        <div className={styles.modal}>
          <h2>Nuevo chat</h2>
          <p>Ingresá el número del usuario con quien querés chatear</p>
          <Input tipo="login" placeholder="Ej: 1155544433" value={targetNumero} onChange={(e) => setTargetNumero(e.target.value)} />
          <div className={styles.modalActions}>
            <Boton text="Cancelar" onClick={closePopup} />
            <Boton text="Crear chat" onClick={crearNuevoChat} />
          </div>
        </div>
      </Popup>
    </div>
  );
} 
