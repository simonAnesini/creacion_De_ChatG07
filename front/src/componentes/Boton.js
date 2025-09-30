"use client";

import React from "react";

/**
 * Props:
 * - text: texto del botón
 * - tipo: (opcional) "login" | "small" | "danger" (afecta estilos)
 * - onClick, disabled
 */
export default function Boton({ text, tipo, onClick, disabled }) {
  const base = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 4px 12px rgba(15,30,60,0.06)",
  };

  const variants = {
    login: { background: "#2b7cff", color: "#fff" },
    small: { background: "#eef5ff", color: "#123" },
    danger: { background: "#ff6b6b", color: "#fff" },
  };

  const style = { ...base, ...(variants[tipo] || variants["login"]) };

  return (
    <button style={style} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}
