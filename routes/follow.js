// EXPRESS NOS PERMITA TRABAJAR CON LOS METODOS DEL CURD POR ESO LO IMPORTAMOS 
const express = require('express');
const router = express.Router();
const FollowController = require('../controllers/follow');

// definimos las rutas 
router.get("/prueba-follow", FollowController.pruebaFollow);

// exortamos el router 
module.exports = router;