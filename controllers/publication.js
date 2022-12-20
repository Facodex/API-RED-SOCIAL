// ACCIONES DE PRUEBA 
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "MESSAGE SENDED FROM: CONTROLLERS/publication.js"
    });
}


// EXPORTAR ACCIONES 
module.exports = {
    pruebaPublication
}