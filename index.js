// importamos depenencias 
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

// msj de bienvenda que arranco bien 
console.log("API RUNING!");

//conexion a la base de datos
connection();

//crear servidor node
const app = express();
const puerto = 3900;

//configurar cors
app.use(cors());

//convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//cargar conf de las rutas (las que estan en la carpeta routes)
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publications", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

// ruta de prueba 
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "name": "facundo",
            "web": "facodex.tech"
        }
    );
});

//poner el servidor a escuchar peticiones
app.listen(puerto, () => {
    console.log("SERVIDOR RUNNING IN PORT: " + puerto);
});