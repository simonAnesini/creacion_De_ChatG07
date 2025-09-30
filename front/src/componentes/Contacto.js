"use client";

import React from "react";

/**
 * Props:
 * - chat o chats: objeto del chat (p/compatibilidad con tus imports)
 * - isSelected: boolean
 * - onClick: handler
 *
 * Se espera que el objeto chat tenga alguna de estas propiedades:
 *   .display_name, .nombre, .chat_name, .username
 * También admite .foto o .photo (si existe).
 */
export default function Contacto({ chat, chats, isSelected, onClick }) {
  const c = chat || chats || {};
  const nombre = c.display_name || c.nombre || c.chat_name || c.username || "Contacto";
  const foto = c.foto || c.photo || c.avatar || null;

  const container = {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: 8,
    background: isSelected ? "#eef6ff" : "transparent",
    cursor: "pointer",
    transition: "background .15s",
  };

  const avatarStyle = {
    width: 44,
    height: 44,
    borderRadius: "50%",
    objectFit: "cover",
    background: "#f0f2f7",
  };

  return (
    <div style={container} onClick={onClick}>
      <img
        src={foto || "/default-avatar.png"}
        alt={nombre}
        style={avatarStyle}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <strong style={{ fontSize: 14 }}>{nombre}</strong>
        {c.numero && <small style={{ color: "#667", fontSize: 12 }}>{c.numero}</small>}
      </div>
    </div>
  );
}
