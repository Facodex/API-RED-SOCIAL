// IMPORTAR DEPENDENCIAS Y MODULOS 
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Follow = require('../models/follow');
const Publication = require('../models/publication');

const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

// importamos SERVICIOS 
const jwt = require('../services/jwt');
const followService = require('../services/followService');
const validate = require('../helpers/validate');

// ACCIONES DE PRUEBA 
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "MESSAGE SENDED FROM: CONTROLLERS/user.js",
        usuario: req.user
    });
}

// METODO/ACCION REGISTRO DE USUARIOS 
const register = (req, res) => {
    // recoger datos de la peticion 
    let params = req.body;

    //comprobar que me llegan bien (+ validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "FALTAN DATOS POR ENVIAR",
        });
    }

    // validacion avanzada 
    try {
        validate(params);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "VALIDACION NO SUPERADA",
        });
    }
    

    //control usuarios duplicados 
    User.find({

        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]

    }).exec(async (error, users) => {
        if (error) return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios" });

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }


        //cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        //crear objeto de usario con los datos validados
        let user_to_save = new User(params);

        //guardar usuario en la DB
        user_to_save.save((error, userStored) => {
            if (error || !userStored) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al guardar el usuario"
                });
            }


            //devolver resultado 
            return res.status(200).json({
                status: "success",
                message: "USUARIO REGISTRADO CORRECTAMENTE",
                userStored
            });

        });


    });


}

// METODO/ACCION login que devolvera si te identificaste de manera correcta 
const login = (req, res) => {

    // recoger parametros del body 
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "FALTAN DATOS POR ENVIAR",
        });
    }
    // buscar en la BD si existe 
    User.findOne({ email: params.email })
        // .select({"password": 0})
        .exec((error, user) => {
            if (error || !user) {
                return res.status(404).send({
                    status: "error",
                    message: "NO EXISTE EL USUARIO",
                });
            }

            //comporbar su contraseña 
            let pwd = bcrypt.compareSync(params.password, user.password)
            if (!pwd) {
                return res.status(404).send({
                    status: "error",
                    message: "LA CONTRASEÑA ES INCORRECTA",
                });
            }
            // conseguir el token 
            const token = jwt.createToken(user);

            // devolver datos del usuario
            return res.status(200).json({
                status: "success",
                message: "TE HAS IDENTIFICADO CORRECTAMENTE",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            });
        });


}


// METODO PARA TRAER LA INFO DEL USUARIO 
const profile = (req, res) => {
    // RECIBIR EL PARAMETRO DEL ID DEL USUARIO POR LA URL 
    //SERA EL ID DEL USUARIO DEL PERFIL QUE QUEREMOS VER
    const id = req.params.id;

    // CONSULTA PARA SACAR LOS DATOS DEL USUARIO
    User.findById(id)
        .select({ password: 0, role: 0 })
        .exec(async(error, userProfile) => {
            if (error || !userProfile) {
                return res.status(404).send({
                    status: "error",
                    message: "EL USUARIO NO EXISTE O HAY UN ERROR"
                });
            }

            // INFORMACION DE SEGUIMIENTO 
            // req.user.id es el usuario que esta navegando e id es el usuario del perfil que estamos viendo
            const followInfo = await followService.followThisUser(req.user.id, id)
            // DEVOLVER EL RESULTADO 
            return res.status(200).json({
                status: "success",
                user: userProfile,
                following: followInfo.following,    //si lo sigo
                follower: followInfo.follower       //si me sigue
            });

        });


}


// METODO/ACCION LISTADO DE USUARIOS 
const list = (req, res) => {

    // CONTROLAR QUE PAGINA ESTAMOS
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);

    //CONSULTA CON MONGOOSE PAGINATION
    let itemsPerPage = 5; //le digo que quiero 5 usuarios por pagina

    User.find()
        .select('-email -password -role -__v')
        .sort('_id')
        .paginate(page, itemsPerPage, async(error, users, total) => {


        if (error || !users) {
            return res.status(500).send({
                status: "error",
                message: "ERROR EN LA CONSULTA",
                error
            });
        }

        // funcion soy facu y veo la lista de jaqui, sacar un array de ids con los que me siguen y los que sigo  
        let followUserIds = await followService.followUserIds(req.user.id);

        // DEVOLVER EL RESULTADO (POSTERIORMENTE INFO DE FOLLOWS)
        return res.status(200).json({
            status: "success",
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage), //asi redondeamos con math
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });
    });

}


// METODO PARA ACTAULIZAR INFORMACION DEL USUARIO 
const update = (req, res) => {

    // recoger info del usuario 
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // eliminar campos sobrantes 
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // comprobar si el usuario existe
    User.find({

        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]

    }).exec(async (error, users) => {
        if (error) return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios" });

        let userIsset = false;
        users.forEach( user => {
            if(user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }
        
        //cifrar la contraseña
        if(userToUpdate.password){
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }else{
            delete userToUpdate.password;
        }

        // buscar y actualizar 
        try {
            let userUpdate = await User.findByIdAndUpdate( {_id: userIdentity.id}, userToUpdate, {new: true});

            if(!userUpdate ){
                return res.status(404).send({
                    status: "error",
                    message: "ERROR CON EL USUARIO A ACTUALIZAR"
                });
            }

            // devuelvo respuesta 
            return res.status(200).json({
                status: "success",
                message: "Metodo para actualizar info del usuario",
                user: userUpdate
            });

        } catch (error) {

            return res.status(500).send({
                status: "error",
                message: "ERROR AL ACTUALIZAR USUARIO"
            });

        } 
    });

}

// METODO/ACCION UPLOAD IMAGE 
const upload = (req, res) => {

    // RECOGER EL FICHERO DE IMAGEN Y COMPORBAR QUE EXISTE
    if(!req.file){
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
    if( extension != 'png' && extension != 'jpg' && extension != 'jpeg' && extension != 'gif'){

        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);

        return res.status(500).send({
            status: "error",
            message: "NO HAS SUBIDO UN ARCHIVO DE IMAGEN"
        });
    }    

    

    // SI ES CORRECTA GUARDAD IMAGEN EL LA BASE DE DATOS 

    User.findOneAndUpdate({ _id: req.user.id }, {image: req.file.filename}, {new: true}, (error, userUpdate) => {

        if(error || !userUpdate){
            return res.status(400).json({
                status: "error",
                message: "ERROR EN LA SUBIDA DEL AVATAR"
            });
        }

        // DEVOLVER RESPUESTA 
        return res.status(200).json({
            status: "success",
            user: userUpdate,
            file: req.file,
        });
    });

}


// METODO/ACCION PARA SACAR EL AVATAR 
const avatar = (req, res) => {

    // SACAR EL PARAMETRO DE LA URL 
    const file = req.params.file;

    // MONTAR EL PATH REAL DE LA IMAGEN 
    const filePath = './uploads/avatars/' + file;

    // COMPROBAR QUE EL ARCHIVO EXISTE 
    fs.stat(filePath, (error, exists) => {
        if(!exists){
            return res.status(404).json({
                status: "error",
                message: "NO EXISTE LA IMAGEN"
            });
        }

        // DEVOLVER UN FILE 
        return res.sendFile(path.resolve(filePath));
    });
    
}

// metodo counter para sacar el numero de seguidos y seguidores 
const counters = async (req, res) => {

    let userId = req.user.id;

    if(req.params.id){ userId = req.params.id; }

    try {
        const following = await Follow.count({"user": userId});

        const followed = await Follow.count({"followed": userId});

        const publications = await Publication.count({"user": userId});

        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        });

    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "NO EN LOS CONTADORES"
        });
    }
}


// EXPORTAR ACCIONES 
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}