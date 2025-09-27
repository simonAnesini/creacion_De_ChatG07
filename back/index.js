/*const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { realizarQuery } = require('./modulos/mysql');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
<<<<<<< Updated upstream
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/traerUsuarios", async function(req,res){


 
  try {
    if(req.body.nuevoUsuario){
      let validacion = await realizarQuery(`SELECT * FROM Users WHERE numero = "${req.body.numero}"`)
      if (validacion.length === 0) {
       await realizarQuery(`INSERT INTO Users (nombre, contraseña, numero) VALUES
          ("${req.body.nombre}", "${req.body.contraseña}", "${req.body.numero}")`)
          res.send(req.body.numero)
      } else {
        res.send("ya existe un usuario con este numero")
      }
    }else{
      let validacion = await realizarQuery(`SELECT * FROM Users WHERE numero = "${req.body.numero}" and contraseña = "${req.body.contraseña}" and nombre = "${req.body.nombre}"`)
      if (validacion.length === 0) {
       await realizarQuery(`INSERT INTO Users (nombre, contraseña, numero) VALUES
          ("${req.body.nombre}", "${req.body.contraseña}", "${req.body.numero}")`)
          res.send(req.body.numero)
      } else {
        res.send("ya existe un usuario con este numero")
    }}
  }catch (error) {
    console.log(req.body)
     res.send(error)
  }
  
})

app.get("/revisarUsuarios", async function(req,res){
  try {
    console.log("funcionando :D")
      let validacion = await realizarQuery(`SELECT * FROM Users WHERE nombre="${req.query.numero}`)
      if (validacion.length !== 0) {
       
      } else {
        res.send("ya existe un usuario con este numero")
      }
  }catch (error) {
     res.send(error)
  }
  
})
=======
  console.log(`Server running at http://localhost:${port}`);
});*/


//lo de arriba son cosas del trabajo anterior a borrar eventualmente, lo guardamos solo para usar de base
var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');
const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicializo express
var port = process.env.PORT || 4000; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res){
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});

app.get("/traerUsuarios", async (req, res) => {
  try {
    //Siempre q estoy en un get recibo los datos en el query
    console.log(req.query.parametro);
    const usuarios = await realizarQuery(
      `SELECT * FROM Users`
    );
    res.send(usuarios);
  } catch (error) {
    res.status(500).send({ error: "Error en el servidor" });
  }
});

app.post("/traerUsuarios", async (req, res) => {
  try {
    // Validar si existe el usuario por número
    const { nombre, contraseña, numero } = req.body;
    let validacion = await realizarQuery(
      `SELECT * FROM Users WHERE numero = ?`, [numero]
    );

    if (validacion.length === 0) {
      // Insertar nuevo usuario
      await realizarQuery(
        `INSERT INTO Users (nombre, contraseña, numero) VALUES (?, ?, ?)`,
        [nombre, contraseña, numero]
      );
    } else {
      // Si ya existe, no insertar y devolver usuarios
      // Opcional: puedes devolver un mensaje de error si quieres
    }

    // Devolver todos los usuarios
    const users = await realizarQuery(`SELECT * FROM Users`);
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error en el servidor" });
  }
});

// NUEVO: LOGIN
app.post('/login', async (req, res) => {
  try {
    const { numero, contraseña, nombre } = req.body;
    console.log("LOGIN BODY:", req.body);
    if (!numero || !contraseña || !nombre) {
      return res.status(400).json({ message: "Faltan datos", login: false });
    }
    const query = `SELECT * FROM Users WHERE numero=? AND contraseña=? AND nombre=?`;
    const resultado = await realizarQuery(query, [numero, contraseña, nombre]);
    if (resultado.length > 0) {
      res.json({ message: "¡Inicio de sesión exitoso!", login: true });
    } else {
      res.json({ message: "Usuario o contraseña incorrectos", login: false });
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Error al iniciar sesión", login: false });
  }
});

// NUEVO: REGISTER
app.post('/register', async (req, res) => {
  try {
    const { numero, contraseña, nombre } = req.body;
    console.log("REGISTER BODY:", req.body);
    if (!numero || !contraseña || !nombre) {
      return res.status(400).json({ message: "Faltan datos", login: false });
    }
    const duplicado = await realizarQuery(
      `SELECT * FROM Users WHERE numero=? OR nombre=?`,
      [numero, nombre]
    );
    if (duplicado.length > 0) {
      return res.json({ message: "El usuario ya existe", login: false });
    }
    await realizarQuery(
      `INSERT INTO Users (numero, contraseña, nombre) VALUES (?, ?, ?)`,
      [numero, contraseña, nombre]
    );
    res.json({ message: "Registro exitoso", login: true });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Error al registrar", login: false });
  }
});

//Pongo el servidor a escuchar
app.listen(port, function(){
    console.log(`Server running in http://localhost:${port}`);
});
>>>>>>> Stashed changes

