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
        .exec();;

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

const followThisUser = async( identityUserId, profileUserId ) => {

}

module.exports = {
    followUserIds,
    followThisUser
}