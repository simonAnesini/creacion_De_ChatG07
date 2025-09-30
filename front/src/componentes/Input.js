"use client";

import React from "react";

/**
 * Props soportadas:
 * - tipo: string (p.ej. "login", "chat", "mail", "password", "tel", "url")
 * - type: override del tipo HTML (p.ej. "email", "password")
 * - placeholder, value
 * - onChange, onKeydown (uso en tus páginas) y onKeyDown
 * - page: (opcional) para estilos diferenciales
 */
export default function Input(props) {
  const { tipo, type, placeholder, value, page } = props;

  // mapear "tipo" a type de HTML si no se pasa `type`
  const inferredType =
    type ||
    (tipo === "mail" ? "email" :
     tipo === "password" ? "password" :
     tipo === "tel" ? "tel" :
     tipo === "url" ? "url" :
     "text");

  const handleChange = (e) => {
    if (props.onChange) props.onChange(e);
  };

  const handleKey = (e) => {
    if (props.onKeydown) props.onKeydown(e);
    if (props.onKeyDown) props.onKeyDown(e);
  };

  // estilos inline simples; podés reemplazarlos por module.css si preferís
  const baseStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #dfe7f2",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  };

  const pageStyle = page === "chat" ? { padding: "12px 14px" } : {};

  return (
    <input
      type={inferredType}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKey}
      style={{ ...baseStyle, ...pageStyle }}
    />
  );
}
