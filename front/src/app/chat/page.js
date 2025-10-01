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
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [membersInput, setMembersInput] = useState(""); // números separados por comas
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
      // data.message tiene {id_chat, texto, numero, id}
      // Solo agregar al historial si pertenezca al chat abierto
      console.log("newMessage (socket):", data);
      if (data && data.message) {
        const msg = data.message;
        // si el chat abierto es el del mensaje, agregalo
        if (selectedChat && String(msg.id_chat) === String(selectedChat.id)) {
          setMensajes((prev) => [...prev, msg]);
        } 
      }
    });

    socket.on("chat-messages", (data) => {
      console.log("chat-messages:", data);
    });

    socket.on("pingAll", (d) => console.log("pingAll:", d));

    return () => {
      socket.disconnect();
    };
  }, [selectedChat]); 

  useEffect(() => {
    const numero = localStorage.getItem("userNumero");
    if (!numero) {
      console.warn("No userNumero en localStorage - redirigir al login");
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

  const openPopup = () => {
    setIsGroup(false);
    setGroupName("");
    setMembersInput("");
    setTargetNumero("");
    setPopupOpen(true);
  };
  const closePopup = () => {
    setPopupOpen(false);
    setMembersInput("");
    setTargetNumero("");
    setGroupName("");
  };

  async function crearNuevoChat() {
    const userNumero = localStorage.getItem("userNumero");
    try {
      let body;
      if (isGroup) {
        // incluir al creador automáticamente
        const members = membersInput.split(",").map(m => m.trim()).filter(Boolean);
        if (members.length === 0) {
          alert("Ingresá al menos un número para el grupo");
          return;
        }
        if (!groupName.trim()) {
          alert("Ingresá un nombre para el grupo");
          return;
        }
        // asegurar que el creador esté en la lista
        if (!members.includes(userNumero)) members.push(userNumero);
        body = { userNumero, members, groupName: groupName.trim() };
      } else {
        if (!targetNumero.trim()) { alert("Ingresá el número del usuario"); return; }
        body = { userNumero, targetNumero: targetNumero.trim() };
      }

      const resp = await fetch("http://localhost:4000/newChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await resp.json();

      if (result.res === true) {
        alert(result.existing ? "Chat existente" : "Chat creado");
        closePopup();
        cargarChats(userNumero);
        if (result.chatId) {
          // seleccionar nuevo chat 
          setTimeout(() => {
            // encontrar chat en lista y seleccionarlo
            cargarChats(userNumero).then(() => {
              const found = chats.find(c => String(c.id) === String(result.chatId));
              if (found) seleccionarChat(found);
              else seleccionarChat({ id: result.chatId, nombre: result.chatName || groupName || targetNumero });
            });
          }, 200);
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

    // limpiar input
    setNuevoMensaje("");

    try {
      // backend guarda y emite 'newMessage' al room correspondiente
      await fetch("http://localhost:4000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // no emitimos por socket desde cliente para evitar duplicados
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
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <h3>{selectedChat.nombre || selectedChat.display_name}</h3>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {selectedChat.participants && selectedChat.participants.length > 0
                    ? `Miembros: ${selectedChat.participants.map(p => p.nombre || p.numero).join(", ")}`
                    : null}
                </div>
              </div>
            </div>

            <div className={styles.messages}>
              {mensajes.length === 0 && <div className={styles.noMessages}>No hay mensajes</div>}
              {mensajes.map((m, idx) => (
                <Mensaje key={idx} texto={m.texto} numero={m.numero} isMine={String(m.numero) === String(localStorage.getItem("userNumero"))} />
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

          <div style={{ marginBottom: 8 }}>
            <label><input type="checkbox" checked={isGroup} onChange={(e)=>setIsGroup(e.target.checked)} /> Crear grupo</label>
          </div>

          {isGroup ? (
            <>
              <Input tipo="login" placeholder="Nombre del grupo" value={groupName} onChange={(e)=>setGroupName(e.target.value)} />
              <small>Ingresá números separados por coma (ej: 1155551111, 1155552222)</small>
              <Input tipo="login" placeholder="Números separados por coma" value={membersInput} onChange={(e)=>setMembersInput(e.target.value)} />
            </>
          ) : (
            <>
              <Input tipo="login" placeholder="Número del usuario" value={targetNumero} onChange={(e)=>setTargetNumero(e.target.value)} />
            </>
          )}

          <div className={styles.modalActions}>
            <Boton text="Cancelar" onClick={closePopup} />
            <Boton text="Crear chat" onClick={crearNuevoChat} />
          </div>
        </div>
      </Popup>
    </div>
  );
}

