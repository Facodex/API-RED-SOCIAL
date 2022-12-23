// EXPRESS NOS PERMITA TRABAJAR CON LOS METODOS DEL CURD POR ESO LO IMPORTAMOS 
const express = require('express');
const router = express.Router();
const FollowController = require('../controllers/follow');
const check = require('../middlewares/auth'); 


// definimos las rutas 
router.get("/prueba-follow", FollowController.pruebaFollow);
router.post("/save", check.auth, FollowController.save);
router.delete("/unfollow/:id", check.auth, FollowController.unfollow);
router.get("/following/:id?/:page?", check.auth, FollowController.following);
router.get("/followers/:id?/:page?", check.auth, FollowController.followers);


// exortamos el router 
module.exports = router;