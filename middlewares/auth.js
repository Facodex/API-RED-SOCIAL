// IMPORTAR DEPENDENCIAS O MUDULOS 
const jwt = require('jwt-simple');
const moment = require('moment');

// IMPORTAR CLAVE SECRETA 
const libjwt = require('../services/jwt');
const secret = libjwt.secret;

// FUNCION MIDDLEWARE DE AUTENTICACION 
exports.auth = (req, res, next) => {

    // COMPROBAR SI LLEGA LA CABECERA DE AUTH 
    if( !req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion"
        });
    }
    // LIMPIAR EL TOKEN 
    let token = req.headers.authorization.replace(/['"]+/g, '');
    // DECODIFICAR EL TOKEN
    try {
        let payload = jwt.decode(token, secret);

        // comprobar expiracion del token
        if( payload.exp <= moment().unix()){
            return res.status(404).send({
                status: "error",
                message: "TOKEN EXPIRADO",
            });
        }

        // AGREGAR DATOS DE USUARIO A LA REQUEST 
        req.user = payload; //creamos la propiedad user dentro de req

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "TOKEN INVALIDO",
            error
        });
    }


    //  PASAR A LA EJECUCION DE LA ACCION
    next();
}


