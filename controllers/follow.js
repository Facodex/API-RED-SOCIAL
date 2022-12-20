// ACCIONES DE PRUEBA 
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "MESSAGE SENDED FROM: CONTROLLERS/follow.js"
    });
}


// EXPORTAR ACCIONES 
module.exports = {
    pruebaFollow
}