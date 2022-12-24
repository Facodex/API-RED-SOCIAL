// IMPROTANDO MODELO Y DEPENDENCIAS Y SERVICIOS
const Publication = require('../models/publication');
const followService = require('../services/followService');

const fs = require('fs');
const path = require('path');

// ACCIONES DE PRUEBA 
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "MESSAGE SENDED FROM: CONTROLLERS/publication.js"
    });
}

// GUARDAR PUBLICAION 
const save = (req, res) => {

    // recoger datos del body
    let params = req.body;

    // si no me llegan dar respuesta negativa 
    if (!params.text) {
        return res.status(400).send({
            status: "error",
            message: "DEBES ENVIAR EL TEXTO DE LA PUBLICACION"
        });
    }

    // crear y rellenar el objeto publicacion 
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    // guardar objeto en BD 
    newPublication.save((error, publicationStored) => {
        if (error || !publicationStored) {
            return res.status(400).send({
                status: "error",
                message: "NO SE HA GUARDADO LA PUBLICACION"
            });
        }

        // RESPUESTA POSITIVA QUE SE GUARDO LA PUBLICACION
        return res.status(200).send({
            status: "success",
            message: "PUBLICACION GUARDADA",
            publicationStored
        });

    });

}

// SACAR UNA PUBLICACION EN ESPECIFICO 
const detail = (req, res) => {

    // sacar id de la publicacion de la url 
    const plublicationId = req.params.id;

    // find de la condicion del id 
    Publication.findById(plublicationId, (error, publicationStored) => {
        if (error || !publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "NO EXISTE LA PUBLICACION",
            });
        }

        return res.status(200).send({
            status: "success",
            message: "PUBLICACION MOSTRADA",
            publicationStored
        });

    });

}

// ELIMINAR PULICACIONES 
const remove = (req, res) => {

    // sacar el id de la publicacion a eliminar 
    const plublicationId = req.params.id;

    // hacer un find y comprobar que solo sean publicaciones del usuario identificado
    Publication.find({ "user": req.user.id, "_id": plublicationId }).remove(error => {
        if (error) {
            return res.status(500).send({
                status: "error",
                message: "ERROR EN ELIMINAR PUBLICACION"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "PUBLICACION ELIMINADA",
            publication: plublicationId
        });

    });

}

// LISTAR PUBLICACIONES DE UN USUAURIO EN ESPECIFICO
const user = (req, res) => {
    // sacar el id del usuario
    const userId = req.params.id;

    // controlar la pagina 
    let page = 1;
    if (req.params.page) page = req.params.page;

    const itemsPerPage = 5;

    // find populate ordenar de mas nuevas a mas viejas, paginar
    Publication.find({ "user": userId })
        .sort('-created_at')
        .populate('user', '-password -__v -role -email')
        .paginate(page, itemsPerPage, (error, publications, total) => {

            if (error || !publications || publications.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    message: "EL USUARIO NO TIENE PUBLICACIONES",
                });
            }

            return res.status(200).send({
                status: "success",
                message: "PUBLICACIONES DEL USUARIO",
                page,
                total,
                pages: Math.ceil(total / itemsPerPage),
                publications
            });

        });

}


// FUNCION PARA SUBIR FICHEROS 
const upload = (req, res) => {

    // SACAR ID DE LA PUBLICACION ACTUAL
    const publicationId = req.params.id;

    // RECOGER EL FICHERO DE IMAGEN Y COMPORBAR QUE EXISTE
    if (!req.file) {
        return res.status(500).send({
            status: "error",
            message: "NO HA LLEGADO LA IMAGEN"
        });
    }
    // CONSEGUIR EL NOMBRE DEL ARCHIVO 
    let image = req.file.originalname;

    // SACAR LA EXTENSION DEL ARCHIVO 
    let imageSplit = image.split('\.')
    let extension = imageSplit[1];

    // COMPROBAR EXTENSION Y SI NO ES CORRECTA BORRAR ARCHIVO 
    if (extension != 'png' && extension != 'jpg' && extension != 'jpeg' && extension != 'gif') {

        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);

        return res.status(500).send({
            status: "error",
            message: "NO HAS SUBIDO UN ARCHIVO DE IMAGEN"
        });
    }



    // SI ES CORRECTA GUARDAD IMAGEN EL LA BASE DE DATOS 

    Publication.findOneAndUpdate({ 'user': req.user.id, '_id': publicationId }, { file: req.file.filename }, { new: true }, (error, publicationUpdated) => {

        if (error || !publicationUpdated) {
            return res.status(400).json({
                status: "error",
                message: "ERROR EN LA SUBIDA DEL AVATAR"
            });
        }

        // DEVOLVER RESPUESTA 
        return res.status(200).json({
            status: "success",
            publication: publicationUpdated,
            file: req.file,
        });
    });

}

// DEVOLVER ARCHIVOS MULTIMEDIA (imagenes)
const media = (req, res) => {

    // SACAR EL PARAMETRO DE LA URL 
    const file = req.params.file;

    // MONTAR EL PATH REAL DE LA IMAGEN 
    const filePath = './uploads/publications/' + file;

    // COMPROBAR QUE EL ARCHIVO EXISTE 
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).json({
                status: "error",
                message: "NO EXISTE LA IMAGEN"
            });
        }

        // DEVOLVER UN FILE 
        return res.sendFile(path.resolve(filePath));
    });

}

// ACCION PARA LISTAR PUBLICACIONES (FEED)
const feed = async (req, res) => {

    // sacar la pagina actual 
    let page = 1;
    if (req.params.page) page = req.params.page

    // establecer num de elementos por paginas 
    let itemsPerPage = 5;

    // sacar un array ids limpios de los usuarios que yo sigo como usuairo identificado 
    try {

        const myFollows = await followService.followUserIds(req.user.id);

        // hacemos un find a publicaciones utilizando operador in, ordenar, popular, paginar
        const publications = await Publication.find({ user: myFollows.following })
            .populate("user", "-password -role -__v -email")
            .sort("-created_at")
            .paginate(page, itemsPerPage, (error, publications, total) => {

                if(error || !publications){
                    return res.status(404).json({
                        status: "error",
                        message: "ERROR EN TRAER PUBLICAIONES"
                    });
                }
                return res.status(200).json({
                    status: "succes",
                    message: "FEEDS DE PUBLICACIONES",
                    following: myFollows.following,
                    publications,
                    page,
                    itemsPerPage,
                    pages: Math.ceil(total / itemsPerPage),
                    total
                });
            });



    } catch (error) {

        return res.status(404).json({
            status: "error",
            message: "HUBO UN ERROR EN TRAER LAS FEEDS"
        });

    }

}

// EXPORTAR ACCIONES 
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}