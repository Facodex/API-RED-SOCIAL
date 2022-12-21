// IMPORTAR DEPENDENCIAS Y MODULOS 
const User = require("../models/user");
const bcrypt = require("bcrypt");
// importamos la funcion que crea el token 
const jwt = require('../services/jwt');
const mongoosePagination = require('mongoose-pagination');

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
    const id = req.params.id;

    // CONSULTA PARA SACAR LOS DATOS DEL USUARIO
    User.findById(id)
        .select({ password: 0, role: 0 })
        .exec((error, userProfile) => {
            if (error || !userProfile) {
                return res.status(404).send({
                    status: "error",
                    message: "EL USUARIO NO EXISTE O HAY UN ERROR"
                });
            }

            // DEVOLVER EL RESULTADO 
            // POSTERIORMENTE DEVOLVER INFO DE FOLLOWS 
            return res.status(200).json({
                status: "success",
                user: userProfile
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

    User.find().sort('_id').paginate(page, itemsPerPage, (error, users, total) => {


        if (error || !users) {
            return res.status(500).send({
                status: "error",
                message: "ERROR EN LA CONSULTA",
                error
            });
        }

        // DEVOLVER EL RESULTADO (POSTERIORMENTE INFO DE FOLLOWS)
        return res.status(200).json({
            status: "success",
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage) //asi redondeamos con math
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
        }  

        // buscar y actualizar 
        User.findByIdAndUpdate( userIdentity.id, userToUpdate, {new: true}, (error, userUpdate) => {

            if(error || !userUpdate ){
                return res.status(500).send({
                    status: "error",
                    message: "ERROR AL ACTUALIZAR USUARIO",
                    error
                });
            }

            // devuelvo respuesta 
            return res.status(200).json({
                status: "success",
                message: "Metodo para actualizar info del usuario",
                user: userUpdate
            });
        });

        
        
    });
        
}

// EXPORTAR ACCIONES 
module.exports = {
            pruebaUser,
            register,
            login,
            profile,
            list,
            update
        }