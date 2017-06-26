"use strict";

class Formatter {
    
    static userProfile(user, unreadMessages) {
        const keys = ['id', 'firstName', 'lastName', 'nickName', 'email', 'token', 'allowFriends', 'allowRandom', 'meetsCount', 'avatar', 'phone', 'friends', 'requestsFrom', 'pushesEnabled'];
        let response = {};
        for (let i = 0; i < keys.length; i++) {
            response[keys[i]] = user[keys[i]];
        }
        if (user.user_id) {
            response.id = user.user_id;
        }
//        let response = Helper.leftKeys(user.toJSON(), keys);
        response.unreadMessages = unreadMessages;
        response.friendRequests = response.requestsFrom.length;
        response.friendsCount = response.friends.length;
        delete response.friends;
        delete response.requestsFrom;
        return response;
    }
    
    static shortProfile(user) {
        let response = {};
        if (user.user_id) {
            response.id = user.user_id;
        } else {
            response.id = user.id;
        }
        response.nickName = user.nickName;
        response.avatar = user.avatar;
        return response;
    }
    
}

module.exports.Formatter = Formatter;