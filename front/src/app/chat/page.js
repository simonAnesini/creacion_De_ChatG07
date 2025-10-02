
"use client";

import React, { useEffect, useRef, useState } from "react";
import Input from "@/componentes/Input";
import Contacto from "@/componentes/Contacto";
import Mensaje from "@/componentes/Mensaje";
import Boton from "@/componentes/Boton";
import Popup from "reactjs-popup";
import io from "socket.io-client";
import styles from "./page.module.css";

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);

  // grupos
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupPhoto, setGroupPhoto] = useState("");
  const [membersInput, setMembersInput] = useState("");
  const [targetNumero, setTargetNumero] = useState("");

  const socketRef = useRef(null);

  useEffect(() => {
    //  socket
    const socket = io("http://localhost:4000", { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket conectado:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado");
    });

    socket.on("newMessage", (data) => {
      if (data && data.message) {
        const msg = data.message;
        if (selectedChat && String(msg.id_chat) === String(selectedChat.id)) {
          setMensajes((prev) => [...prev, msg]);
        }
      }
    });

    socket.on("chat-messages", (data) => {
      console.log("chat-messages:", data);
    });

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
        const normalized = result.chats.map((c) => ({
          ...c,
          photo: c.photo || (c.participants && c.participants[0] && c.participants[0].foto) || DEFAULT_AVATAR,
        }));
        setChats(normalized);
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
    setGroupPhoto("");
    setMembersInput("");
    setTargetNumero("");
    setPopupOpen(true);
  };
  const closePopup = () => {
    setPopupOpen(false);
    setMembersInput("");
    setTargetNumero("");
    setGroupName("");
    setGroupPhoto("");
  };

  async function crearNuevoChat() {
    const userNumero = localStorage.getItem("userNumero");
    try {
      let body;
      if (isGroup) {
        const members = membersInput.split(",").map(m => m.trim()).filter(Boolean);
        if (members.length === 0) { alert("Ingresá al menos un número para el grupo"); return; }
        if (!groupName.trim()) { alert("Ingresá un nombre para el grupo"); return; }
        if (!members.includes(userNumero)) members.push(userNumero);
        body = { userNumero, members, groupName: groupName.trim(), groupPhoto: groupPhoto.trim() || null };
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
          setTimeout(() => {
            cargarChats(userNumero).then(() => {
              const found = chats.find(c => String(c.id) === String(result.chatId));
              if (found) seleccionarChat(found);
              else seleccionarChat({
                id: result.chatId,
                nombre: result.chatName || groupName || targetNumero,
                photo: result.chatPhoto || groupPhoto || DEFAULT_AVATAR
              });
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
    const payload = { id_chat: selectedChat.id, texto: nuevoMensaje.trim(), numero };
    setNuevoMensaje("");

    try {
      await fetch("http://localhost:4000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error enviarMensaje:", err);
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") enviarMensaje();
  }


  async function updateChatPhoto(chatId, photoUrl) {
    try {
      const resp = await fetch("http://localhost:4000/chat/setPhoto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, fotoUrl: photoUrl || "" }),
      });
      const result = await resp.json();
      if (result.ok) {
        // recargar lista de chats
        const numero = localStorage.getItem("userNumero");
        await cargarChats(numero);
        if (selectedChat && String(selectedChat.id) === String(chatId)) {
          setSelectedChat(prev => ({ ...prev, photo: result.foto || photoUrl || DEFAULT_AVATAR }));
        }
        alert("Foto de grupo actualizada");
      } else {
        alert("No se pudo actualizar la foto: " + (result.message || ""));
      }
    } catch (err) {
      console.error("Error updateChatPhoto:", err);
      alert("Error al actualizar foto");
    }
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.top}>
          <h2>Chats</h2>
          <div>
            <Boton text="Nuevo chat" tipo="small" onClick={openPopup} />
          </div>
        </div>

        <div className={styles.list}>
          <ul>
            {chats.length === 0 && <li className={styles.empty}>No hay chats</li>}
            {chats.map((c) => (
              <li key={c.id} onClick={() => seleccionarChat(c)}>
                <Contacto chat={{...c, photo: c.photo || DEFAULT_AVATAR}} isSelected={selectedChat && selectedChat.id === c.id} />
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
                <img
                  src={selectedChat.photo || DEFAULT_AVATAR}
                  alt={selectedChat.nombre || selectedChat.display_name || "avatar"}
                  style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                />

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: 0 }}>{selectedChat.nombre || selectedChat.display_name}</h3>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {selectedChat.participants && selectedChat.participants.length > 0
                      ? `Miembros: ${selectedChat.participants.map(p => p.nombre || p.numero).join(", ")}`
                      : null}
                  </div>
                </div>
              </div>

              <div>
                {selectedChat.es_grupo === 1 && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Input tipo="url" placeholder="URL foto grupo" value={groupPhoto} onChange={(e) => setGroupPhoto(e.target.value)} />
                    <Boton text="Set Foto" tipo="small" onClick={() => updateChatPhoto(selectedChat.id, groupPhoto)} />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.messages}>
              {mensajes.length === 0 && <div className={styles.noMessages}>No hay mensajes</div>}
              {mensajes.map((m, idx) => (
                <Mensaje
                  key={m.id || idx}
                  texto={m.texto}
                  numero={m.numero}
                  isMine={String(m.numero) === String(localStorage.getItem("userNumero"))}
                />
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
              <Input tipo="url" placeholder="URL de la foto del grupo (opcional)" value={groupPhoto} onChange={(e)=>setGroupPhoto(e.target.value)} />
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
