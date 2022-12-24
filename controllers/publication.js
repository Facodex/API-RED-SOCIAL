// IMPROTANDO MODELO Y DEPENDENCIAS
const Publication = require('../models/publication');

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
    if(!params.text){
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
        if(error || !publicationStored){
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
        if(error || !publicationStored){
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
    Publication.find({"user": req.user.id, "_id": plublicationId}).remove(error => {
        if(error){
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

// ACCION PARA LISTAR PUBLICACIONES 


// LSITAR PUBLICACIONES DE UN USUAURIO EN ESPECIFICO


// FUNCION PARA SUBIR FICHEROS 


// DEVOLVER ARCHIVOS MULTIMEDIA (imagenes)

// EXPORTAR ACCIONES 
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove
}