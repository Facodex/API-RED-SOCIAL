// IMPORTAR DEPENDENCIAS O MUDULOS 
const jwt = require('jwt-simple');
const moment = require('moment');

// IMPORTAR CLAVE SECRETA 
const libjwt = require('../services/jwt');
const secret = libjwt.secret;

// FUNCION DE AUTENTICACION 
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
    
    // AGREGAR DATOS DE USUARIO A LA REQUEST 

    //  PASAR A LA EJECUCION DE LA ACCION
}


