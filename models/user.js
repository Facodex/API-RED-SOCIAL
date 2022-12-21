// este sera el modelo de usuario 
// lo hacemos gracias a los metodos chema y model de mongoose 

const {Schema, model} = require("mongoose");

const UserSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        surname: String,
        nick: {
            type: String,
            required: true
        },
        bio: String,
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: "role_user"
        },
        image: {
            type: String,
            default: "default.png"
        },
        created_at: {
            type: Date,
            default: Date.now
        }
    }
);

// exporto el modelo pasando 3 parametros => nombre, formato, collecion donde se guardará
module.exports = model("User", UserSchema, "users");