// EXPRESS NOS PERMITA TRABAJAR CON LOS METODOS DEL CURD POR ESO LO IMPORTAMOS 
const express = require('express');
const router = express.Router();
const PublicationController = require('../controllers/publication');

// definimos las rutas 
router.get("/prueba-publication", PublicationController.pruebaPublication);

// exortamos el router 
module.exports = router;