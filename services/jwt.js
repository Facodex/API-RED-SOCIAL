// IMPORTAR DEPENDENCIAS
const jwt = require('jwt-simple');
const moment = require('moment');


// CLAVE SECRETA
const secret = "CLAVE_SECRETA_DEL_PROYECTO_DE_LA_RED_SOCIAL_98";

// CREAR FUNCION PARA GENERAR TOKENS 
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(), //creamos el momento de creacion
        exp: moment().add(30, "days").unix()//fecha de expiracion
    };

    // DEVOLVER JWT TOKEN CODIFICADO 
    return jwt.encode(payload, secret);

}

module.exports = {
    secret,
    createToken
}

