// importar modelo 
const Follow = require("../models/follow");
const User = require("../models/user");

// ACCIONES DE PRUEBA 
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "MESSAGE SENDED FROM: CONTROLLERS/follow.js"
    });
}

// METODO/ACCION SEGUIR A USUARIO
const save = ( req, res ) => {

    // conseguir datos del body 
    const params = req.body;

    // sacar id del usuario identificado
    const identity = req.user;

    // crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id,          // persona que hace la accion seguir
        followed: params.followed   // persona a la que sigue
    });


    // guardar objecto en la BD 
    userToFollow.save((error, followStored) => {

        if(error || !followStored){

            return res.status(500).send({
                status: "error",
                message: "no se ha podido seguir al usuario"
            });

        }
        return res.status(200).send({
            status: "succes",
            identity: req.user,
            follow: followStored
        });
    })

    
}


// METODO/ACCION DEJAR DE SEGUIR A USUARIO
const unfollow = (req, res) => {

    // recoger el id del usuario identificado 
    const userId = req.user.id;

    // recoger el id que sigo y quiero dejar de seguir 
    const followedId = req.params.id;

    // find de las coincidencias y hacer remove
    Follow.find({
        "user" : userId,
        "followed" : followedId
    }).remove((error, followDeleted) => {

        if(error || !followDeleted){
            return res.status(500).send({
                status: "error",
                message: "no se ha podido dejar de seguir al usuario"
            });
        }

        return res.status(200).send({
            status: "succes",
            message: "Follow eliminado correctamente"
        });
    });


    
} 

// METODO/ACCION LISTADO USUARIOS QUE SIGO 

// METODO/ACCION LISTADO DE USUARIOS QUE ME SIGUEN


// EXPORTAR ACCIONES 
module.exports = {
    pruebaFollow,
    save,
    unfollow
}