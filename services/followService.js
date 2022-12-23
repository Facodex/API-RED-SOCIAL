const Follow = require('../models/follow');

// funcion para sacar quienes me siguen y a quienes sigo de una lista 
// identityUserId => Siempre será la persona que esta navegando en la red social
const followUserIds = async( identityUserId ) => {

    try {

        // asi sacamos la informacion de los seguidos 
        let following = await Follow.find({"user": identityUserId})
        .select({"followed": 1, "_id": 0})
        .exec();

        // asi sacamos la informacion de los seguidores
        let followers = await Follow.find({"followed": identityUserId})
        .select({"user": 1, "_id": 0})
        .exec();

        // procesar la informacion de seguidos y seguidores 
        // seguidos
        let followingClean = [];
        following.forEach( follow =>{
            followingClean.push(follow.followed);
        });

        // seguidores
        let followersClean = [];
        followers.forEach( follow =>{
            followersClean.push(follow.user);
        });

        return {
            following: followingClean,
            followers: followersClean
        }

    } catch (error) {
        return {};
    }
    
    
}


// funcion para saber si a un usuario unico lo sigo y si el me sigue
// identityUserId => Siempre será la persona que esta navegando en la red social
// profileUserId => Es el otro usuario al que quiero saber si sigo y si me sigue 
const followThisUser = async( identityUserId, profileUserId ) => {

    // sacando si sigo este usuairo "user soy yo" "followed es la persona que sigo"
    let following = await Follow.findOne({"user": identityUserId, "followed": profileUserId});

    // sacando si me sigue este usuairo "user es el usuario" "followed soy yo"
    let follower = await Follow.findOne({"user": profileUserId, "followed": identityUserId});

    return {
        following,
        follower
    }
}


module.exports = {
    followUserIds,
    followThisUser
}