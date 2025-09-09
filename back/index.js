const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { realizarQuery } = require('./modulos/mysql');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const query = `SELECT * FROM Usuarios WHERE userName='${userName}' AND email='${email}' AND password='${password}'`;
    const resultado = await realizarQuery(query);
    if (resultado.length > 0) {
      res.send({ message: "¡Inicio de sesión exitoso!", login: true })
    }
    else {
      res.send({ message: "Usuario o contraseña incorrectos", login: false });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }

});

app.post('/register', async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const duplicado = await realizarQuery(`SELECT * FROM Usuarios WHERE userName='${userName}'`);
    if (duplicado.length > 0) {
      res.send({ message: "El usuario ya existe", login: false });
    }
    await realizarQuery(`INSERT INTO Usuarios (userName, email, password) VALUES ('${userName}', '${email}', '${password}')`);
    res.send({ message: "Registro exitoso", login: true });

  }
  catch (error) {
    res.status(500).json({ error: "Error al registrar" });
  }
});

// Endpoint: devuelve todos los usuarios
// Asegura que el campo id exista (ajusta si tu tabla tiene otro nombre, por ejemplo idUsuario)
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await realizarQuery('SELECT userName, email, password, IFNULL(totalTime, 0) AS totalTime FROM Usuarios');
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer usuarios' });
  }
});

app.get('/consignas', async (req, res) => {
  const resultado = await realizarQuery("SELECT * FROM Consignas");
  res.json(resultado);
});

app.get('/jugadoresPorConsigna', async (req, res) => {
  const resultado = await realizarQuery("SELECT * FROM JugadoresPorConsigna");
  res.json(resultado);
});

app.get('/jugadores', async (req, res) => {
  const resultado = await realizarQuery("SELECT * FROM Jugadores");
  res.json(resultado);
});
// ...eliminados GET duplicados o innecesarios...

/// post
// ...existing code...
// ...eliminado endpoint duplicado...

// ...existing code...

// ...existing code...
// falta jugadores x consigna
///////////////////////////////////////////

// puts (modificar datos)

// ...existing code...
//falta jugadores x consigna
/////////////////////////////

// eliminar datos
// ...existing code...

app.delete('/jugadoresPorConsigna/:idJugadorConsigna', async function (req, res) {
  await realizarQuery(`DELETE FROM JugadoresPorConsigna WHERE idJugadorConsigna=${req.params.idJugadorConsigna}`);
  res.send("Jugador por consigna eliminado");
});




// ...existing code...

app.post('/usuarios', async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const dup = await realizarQuery(
      `SELECT * FROM Usuarios WHERE userName='${userName}' OR email='${email}'`
    );
    if (dup.length > 0) {
      return res.json({ message: "El usuario ya existe", success: false });
    }
    await realizarQuery(
      `INSERT INTO Usuarios (userName, email, password) VALUES ('${userName}', '${email}', '${password}')`
    );
    res.json({ message: "Usuario agregado con éxito", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al insertar usuario" });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  const { userName, email, password, totalTime } = req.body;
  const userNameOriginal = req.params.id;
  try {
    let setFields = [];
    if (userName) setFields.push(`userName='${userName}'`);
    if (email) setFields.push(`email='${email}'`);
    if (password) setFields.push(`password='${password}'`);
    if (typeof totalTime !== 'undefined') setFields.push(`totalTime=${parseInt(totalTime)}`);
    if (setFields.length === 0) return res.json({ message: "No hay datos para actualizar", success: false });
    const result = await realizarQuery(
      `UPDATE Usuarios SET ${setFields.join(", ")} WHERE userName='${userNameOriginal}'`
    );
    if (result.affectedRows === 0) {
      return res.json({ message: "No se encontró el usuario para modificar", success: false });
    }
    res.json({ message: "Usuario actualizado correctamente", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  const userName = req.params.id;
  try {
    const result = await realizarQuery(`DELETE FROM Usuarios WHERE userName='${userName}'`);
    if (result.affectedRows === 0) {
      return res.json({ message: "No se encontró el usuario para eliminar", success: false });
    }
    res.json({ message: "Usuario eliminado correctamente", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});


app.get('/totalTime', async (req, res) => {
  try {
    // Asume que en Usuarios existe la columna totalTime con el puntaje
    const totalTime = await realizarQuery(`
        SELECT userName, totalTime 
        FROM Usuarios 
        ORDER BY totalTime DESC
        LIMIT 5
      `);
      res.send(totalTime)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer puntajes' });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


//lo de arriba son cosas del trabajo anterior a borrar eventualmente, lo guardamos solo para usar de base
app.get("/traerUsuarios", async (req,res) =>{
  try {
      const usuarios = await realizarQuery(
        `select * from Users`
      ) 
    res.send(usuarios)
  }catch (error) {
     res.send(error)
  }
})

