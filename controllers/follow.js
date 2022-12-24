// importar modelo 
const Follow = require("../models/follow");
const User = require("../models/user");

// dependencias 
const mongoosePagination = require('mongoose-pagination');

// importar servicios 
const followService = require('../services/followService');

// ACCIONES DE PRUEBA 
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "MESSAGE SENDED FROM: CONTROLLERS/follow.js"
    });
}

// METODO/ACCION SEGUIR A USUARIO
const save = (req, res) => {

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

        if (error || !followStored) {

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
        "user": userId,
        "followed": followedId
    }).remove((error, followDeleted) => {

        if (error || !followDeleted) {
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

// METODO/ACCION LISTADO DE USUARIOS QUE ALGUN USUARIO SIGUE (siguiendo)
const following = (req, res) => {

    // sacar el id del usuario identificado 
    let userId = req.user.id;

    // comprobar si me llega el id por url 
    if (req.params.id) userId = req.params.id;

    // comprobar si me llega la pagina 
    let page = 1;
    if (req.params.page) page = req.params.page;

    // indicar cuantos usuarios por pagina quiero mostrar
    const itemsPerPage = 5;

    // find a follow, popular los datos de los usuarios y paginar
    Follow.find({ user: userId })
        .populate("user followed", "-password -role -__v")
        .paginate(page, itemsPerPage, async (error, follows, total) => {


            // funcion soy facu y veo la lista de jaqui, sacar un array de ids con los que me siguen y los que sigo  
            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "succes",
                message: "LISTADO DE USUARIOS QUE x ESTA SIGUIENDO",
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });

        });

}

// METODO/ACCION LISTADO DE USUARIOS SIGUEN A UN USUARIO (seguidores)
const followers = (req, res) => {

    // sacar el id del usuario identificado 
    let userId = req.user.id;

    // comprobar si me llega el id por url 
    if (req.params.id) userId = req.params.id;

    // comprobar si me llega la pagina 
    let page = 1;
    if (req.params.page) page = req.params.page;

    // indicar cuantos usuarios por pagina quiero mostrar
    const itemsPerPage = 5;

    Follow.find({ followed: userId })
        .populate("user", "-password -role -__v")
        .paginate(page, itemsPerPage, async (error, follows, total) => {


            // funcion soy facu y veo la lista de jaqui, sacar un array de ids con los que me siguen y los que sigo  
            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "succes",
                message: "LISTADO DE USUARIOS QUE SIGUEN AL "+ userId + " de esta metodo",
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });

        });
}


// EXPORTAR ACCIONES 
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}