const mongoose = require("mongoose");

connection = async() => {
    try {
        await mongoose.connect("mongodb://localhost:27017/mi_redsocial");
        console.log("WE ARE CONNECTED");
    } catch (error) {
        console.log(error);
        throw new Error("We can't connect to database");
    }
}

module.exports = connection;