// EXPRESS NOS PERMITA TRABAJAR CON LOS METODOS DEL CURD POR ESO LO IMPORTAMOS 
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// IMPORTAMOS MIDDLEWARES 
const check = require('../middlewares/auth'); 


// importamos multer para subir archivos 
const multer = require('multer');

// metodo que me permitira subir archivos 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars");
    },

    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.now()+'-'+file.originalname);
    }
});

const uploads = multer({storage});


// definimos las rutas 
router.get("/prueba-usuario", check.auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);
router.get("/list/:page?", check.auth, UserController.list);
router.put("/update", check.auth, UserController.update);
router.post("/upload", [check.auth, uploads.single("file0")],UserController.upload);
router.get("/avatar/:file", UserController.avatar);
router.get("/counters/:id", check.auth, UserController.counters);

// exprtamos el router 
module.exports = router;