const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { realizarQuery } = require('./modulos/mysql');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/traerUsuarios", async function(req,res){
  try {
    console.log("funcionando :D")
      let validacion = await realizarQuery(`SELECT * FROM Users WHERE numero = "${req.body.numero}"`)
      console.log(validacion)
      if (validacion.length === 0) {
       await realizarQuery(`INSERT INTO Users (nombre, contraseña, numero) VALUES
          ("${req.body.nombre}", "${req.body.contraseña}", "${req.body.numero}")`)
          res.send(req.body.numero)
      } else {
        res.send("ya existe un usuario con este numero")
      }
  }catch (error) {
     res.send(error)
  }
  
})

app.get("/revisarUsuarios", async function(req,res){
  try {
    console.log("funcionando :D")
      let validacion = await realizarQuery(`SELECT * FROM Users nombre=${req.query.nombre}", contraseña="${req.query.contraseña}", numero="${req.query.numero}`)
      if (validacion.length === 0) {
       await realizarQuery(`INSERT INTO Users (nombre, contraseña, numero) VALUES
          ("${req.body.nombre}", "${req.body.contraseña}", "${req.body.numero}")`)
          res.send(req.body.numero)
      } else {
        res.send("ya existe un usuario con este numero")
      }
  }catch (error) {
     res.send(error)
  }
  
})

