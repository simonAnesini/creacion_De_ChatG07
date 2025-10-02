// index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { realizarQuery } = require("./modulos/mysql");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:3000", "http://localhost:3001"], methods: ["GET", "POST"], credentials: true },
});

server.listen(port, () => console.log(`Server running on http://localhost:${port}`));

/* Endpoints */


app.post("/users/register", async (req, res) => {
  try {
    const { nombre, contraseña, numero, foto } = req.body;
    const validacion = await realizarQuery(`SELECT * FROM Users WHERE numero = "${numero}"`);
    if (validacion.length === 0) {
      await realizarQuery(`INSERT INTO Users (numero, contraseña, nombre, foto) VALUES ("${numero}", "${contraseña}", "${nombre}", "${foto || ""}")`);
      return res.send({ ok: true, message: "Usuario creado", numero });
    } else {
      return res.send({ ok: false, message: "Ya existe un usuario con este número" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ ok: false, message: "Error al crear usuario" });
  }
});


app.post("/users/login", async (req, res) => {
  try {
    const { numero, contraseña } = req.body;
    const result = await realizarQuery(`SELECT * FROM Users WHERE numero = "${numero}" AND contraseña = "${contraseña}"`);
    if (result.length > 0) {
      return res.send({ validar: true, numero: result[0].numero, nombre: result[0].nombre, foto: result[0].foto });
    } else {
      return res.send({ validar: false, message: "Número o contraseña incorrecta" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ validar: false, message: "Error login" });
  }
});

/**
 * Traer chats asociados a un numero (incluye participants y usa la columna Chat.foto si existe)
 */
app.post("/chatsUser", async (req, res) => {
  try {
    const { numero } = req.body;
    const chatsRows = await realizarQuery(`
      SELECT DISTINCT c.id, c.es_grupo, c.nombre, c.foto
      FROM Chat c
      INNER JOIN UsuariosXChat uc ON uc.id_chat = c.id
      WHERE uc.numero = "${numero}"
      ORDER BY c.id DESC
    `);

    const chatsWithParticipants = await Promise.all(chatsRows.map(async (c) => {
      const participants = await realizarQuery(`
        SELECT u.numero, u.nombre, u.foto
        FROM UsuariosXChat uc
        LEFT JOIN Users u ON u.numero = uc.numero
        WHERE uc.id_chat = ${c.id}
      `);

      let display_name = c.nombre || "";
      let photo = c.foto || "";

      if (c.es_grupo === 0) {
        
        const other = participants.find(p => String(p.numero) !== String(numero));
        if (other) {
          display_name = other.nombre || other.numero;
          photo = photo || other.foto || "";
        } else if (participants.length === 1) {
          display_name = participants[0].nombre || participants[0].numero;
          photo = photo || participants[0].foto || "";
        }
      } else {
        
        display_name = c.nombre || "Grupo";
       
      }

      return {
        id: c.id,
        es_grupo: c.es_grupo,
        nombre: c.nombre,
        display_name,
        photo,
        participants
      };
    }));

    return res.send({ success: true, chats: chatsWithParticipants });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Error traer chats" });
  }
});

/**
 * Crear nuevo chat (grupo o 1-1).
 * Si envían groupPhoto -> lo guardamos en Chat.foto al crear grupo.
 */
app.post("/newChat", async (req, res) => {
  try {
    const { userNumero, targetNumero, members, groupName, groupPhoto } = req.body;

    // Si members existe -> crear grupo
    if (Array.isArray(members) && members.length > 0) {
      // Insert con foto (si vino)
      const fotoValue = (groupPhoto && groupPhoto.trim()) ? groupPhoto.replace(/"/g, '\\"') : "";
      const insert = await realizarQuery(`INSERT INTO Chat (es_grupo, nombre, foto) VALUES (1, "${(groupName||"").replace(/"/g,'\\"')}", "${fotoValue}")`);
      const chatId = insert.insertId;

      // Insertar miembros en UsuariosXChat (evitar duplicados)
      const uniqueMembers = Array.from(new Set(members.map(String)));
      for (const m of uniqueMembers) {
        await realizarQuery(`INSERT INTO UsuariosXChat (id_chat, numero) VALUES (${chatId}, "${m}")`);
      }
      return res.send({ res: true, existing: false, chatId, chatName: groupName || "", chatPhoto: fotoValue || null });
    }

    // Si no es grupo -> chat 1-1 con targetNumero
    if (!targetNumero) {
      return res.send({ res: false, message: "No se indicó targetNumero" });
    }

    // validar que target exista
    const target = await realizarQuery(`SELECT * FROM Users WHERE numero = "${targetNumero}"`);
    if (target.length === 0) return res.send({ res: false, message: "Usuario destino no encontrado" });

    // Buscar chat existente entre ambos
    const existing = await realizarQuery(`
      SELECT c.id FROM Chat c
      WHERE c.es_grupo = 0
      AND EXISTS (SELECT 1 FROM UsuariosXChat uc WHERE uc.id_chat = c.id AND uc.numero = "${userNumero}")
      AND EXISTS (SELECT 1 FROM UsuariosXChat uc2 WHERE uc2.id_chat = c.id AND uc2.numero = "${targetNumero}")
    `);

    if (existing.length > 0) {
      return res.send({ res: true, existing: true, chatId: existing[0].id, message: "Chat ya existe" });
    }

    // crear chat nuevo (no grupal)
    const result = await realizarQuery(`INSERT INTO Chat (es_grupo, nombre) VALUES (0, "")`);
    const chatId = result.insertId;
    await realizarQuery(`INSERT INTO UsuariosXChat (id_chat, numero) VALUES (${chatId}, "${userNumero}")`);
    await realizarQuery(`INSERT INTO UsuariosXChat (id_chat, numero) VALUES (${chatId}, "${targetNumero}")`);

    return res.send({ res: true, existing: false, chatId, chatName: target[0].nombre || "" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ res: false, message: "Error newChat" });
  }
});


app.post("/chat/setPhoto", async (req, res) => {
  try {
    const { chatId, fotoUrl } = req.body;
    if (!chatId) return res.send({ ok: false, message: "No se indicó chatId" });
    const safeUrl = (fotoUrl || "").replace(/"/g, '\\"');
    await realizarQuery(`UPDATE Chat SET foto = "${safeUrl}" WHERE id = ${chatId}`);
    return res.send({ ok: true, message: "Foto del chat actualizada", chatId, foto: safeUrl });
  } catch (error) {
    console.error("chat/setPhoto error:", error);
    res.status(500).send({ ok: false, message: "Error al actualizar foto" });
  }
});


app.post("/chatHistory", async (req, res) => {
  try {
    const { id_chat } = req.body;
    const mensajes = await realizarQuery(`
      SELECT m.id, m.id_chat, m.texto, m.numero
      FROM Mensajes m
      WHERE m.id_chat = "${id_chat}"
      ORDER BY m.id ASC
    `);
    return res.send({ res: true, mensajes });
  } catch (error) {
    console.error(error);
    res.status(500).send({ res: false, message: "Error chatHistory" });
  }
});


app.post("/messages", async (req, res) => {
  try {
    const { id_chat, texto, numero } = req.body;
    const insert = await realizarQuery(`INSERT INTO Mensajes (id_chat, texto, numero) VALUES ("${id_chat}", "${texto}", "${numero}")`);
    const mensajeId = insert.insertId;

    const messageObj = { id: mensajeId, id_chat, texto, numero };
    io.to(`chat_${id_chat}`).emit("newMessage", { room: `chat_${id_chat}`, message: messageObj });

    return res.send({ res: true, message: "Mensaje agregado", mensajeId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ res: false, message: "Error messages" });
  }
});


io.on("connection", (socket) => {
  console.log("Cliente socket conectado:", socket.id);

  socket.on("joinRoom", (data) => {
    try {
      const room = data.room;
      if (!room) return;
      socket.join(room);
      console.log(`Socket ${socket.id} join a ${room}`);
      io.to(room).emit("chat-messages", { room, joined: true });
    } catch (err) {
      console.error("joinRoom error", err);
    }
  });

  socket.on("pingAll", (d) => {
    io.emit("pingAll", { from: socket.id, payload: d }); 
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { id_chat, texto, numero } = data;
      const insert = await realizarQuery(`INSERT INTO Mensajes (id_chat, texto, numero) VALUES ("${id_chat}", "${texto}", "${numero}")`);
      const messageObj = { id: insert.insertId, id_chat, texto, numero };
      io.to(`chat_${id_chat}`).emit("newMessage", { room: `chat_${id_chat}`, message: messageObj });
      console.log("sendMessage processed and emitted to room", `chat_${id_chat}`);
    } catch (err) {
      console.error("sendMessage error", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket desconectado:", socket.id);
  });
});
