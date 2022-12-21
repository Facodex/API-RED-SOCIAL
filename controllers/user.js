// IMPORTAR DEPENDENCIAS Y MODULOS 
const User = require("../models/user");
const bcrypt = require("bcrypt");
// importamos la funcion que crea el token 
const jwt = require('../services/jwt');

// ACCIONES DE PRUEBA 
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "MESSAGE SENDED FROM: CONTROLLERS/user.js"
    });
}

// REGISTRO DE USUARIOS 
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
            if (error || !userStored ) {
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

// accion login que devolvera si te identificaste de manera correcta 
const login = (req, res) => {

    // recoger parametros del body 
    let params = req.body;

    if(!params.email || !params.password){
        return res.status(400).send({
            status: "error",
            message: "FALTAN DATOS POR ENVIAR",
        });
    }
    // buscar en la BD si existe 
    User.findOne({email: params.email})
        // .select({"password": 0})
        .exec((error, user) =>{
            if(error || !user){
                return res.status(404).send({
                    status: "error",
                    message: "NO EXISTE EL USUARIO",
                });
            }

            //comporbar su contraseña 
            let pwd = bcrypt.compareSync(params.password, user.password)
            if( !pwd ){
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


// EXPORTAR ACCIONES 
module.exports = {
    pruebaUser,
    register,
    login
}