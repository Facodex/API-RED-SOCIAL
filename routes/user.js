// EXPRESS NOS PERMITA TRABAJAR CON LOS METODOS DEL CURD POR ESO LO IMPORTAMOS 
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// IMPORTAMOS MIDDLEWARES 
const check = require('../middlewares/auth'); 

// definimos las rutas 
router.get("/prueba-usuario", check.auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);

// exprtamos el router 
module.exports = router;