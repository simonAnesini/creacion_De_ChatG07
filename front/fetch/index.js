async function traerUsuarios(){
    let query = await fetch(`http://localhost:4000/traerUsuarios`), {
        method: "GET",
        headers:{"content-type-aplication/json"}
        // body:JSON.stringify(dato)
    }
    let usuario
}