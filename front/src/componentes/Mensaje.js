"use client";

import React from "react";

/**
 * Props compatibles:
 * - message (string) OR texto (string)
 * - date (opcional)
 * - isMyMessage OR isMine (boolean)
 * - numero (opcional) - número del autor
 *
 * Renderiza burbuja alineada a la derecha si es mío, a la izquierda si es ajeno.
 */
export default function Mensaje(props) {
  const texto = props.message || props.texto || "";
  const date = props.date || props.fecha || "";
  const isMine = props.isMyMessage || props.isMine || false;
  const numero = props.numero || props.number || "";

  const wrapper = {
    display: "flex",
    justifyContent: isMine ? "flex-end" : "flex-start",
  };

  const bubble = {
    maxWidth: "75%",
    padding: "10px 12px",
    borderRadius: 12,
    background: isMine ? "#2b7cff" : "#f1f3f6",
    color: isMine ? "#fff" : "#111",
    fontSize: 14,
    lineHeight: 1.3,
    boxShadow: "0 6px 18px rgba(15,30,60,0.04)",
  };

  const metaStyle = {
    marginTop: 6,
    fontSize: 11,
    color: isMine ? "rgba(255,255,255,0.85)" : "#667",
    textAlign: isMine ? "right" : "left",
  };

  return (
    <div style={wrapper}>
      <div style={bubble}>
        <div>{texto}</div>
        {(date || numero) && (
          <div style={metaStyle}>
            {numero ? `${numero}` : null}
            {date ? (numero ? " • " : "") + date : null}
          </div>
        )}
      </div>
    </div>
  );
}
