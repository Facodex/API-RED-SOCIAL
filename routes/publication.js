// EXPRESS NOS PERMITA TRABAJAR CON LOS METODOS DEL CURD POR ESO LO IMPORTAMOS 
const express = require('express');
const router = express.Router();
const PublicationController = require('../controllers/publication');
const check = require('../middlewares/auth');

// importamos multer para subir archivos 
const multer = require('multer');

// metodo que me permitira subir archivos 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications");
    },

    filename: (req, file, cb) => {
        cb(null, "pub-"+Date.now()+'-'+file.originalname);
    }
});

const uploads = multer({storage});

// definimos las rutas 
router.get("/prueba-publication", PublicationController.pruebaPublication);
router.post("/save", check.auth, PublicationController.save);
router.get("/detail/:id", check.auth, PublicationController.detail);
router.delete("/remove/:id", check.auth, PublicationController.remove);
router.get("/user/:id/:page?", check.auth, PublicationController.user);
router.post("/upload/:id", [check.auth, uploads.single('file0')], PublicationController.upload);
router.get("/media/:file", check.auth, PublicationController.media);


// exortamos el router 
module.exports = router;