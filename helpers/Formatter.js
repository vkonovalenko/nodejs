"use strict";

class Formatter {
    
    static userProfile(user, unreadMessages) {
        const keys = ['id', 'firstName', 'lastName', 'nickName', 'email', 'token', 'allowFriends', 'allowRandom', 'meetsCount', 'avatar', 'phone', 'friends', 'requestsFrom'];
        let response = {};
        for (let i = 0; i < keys.length; i++) {
            response[keys[i]] = user[keys[i]];
        }
//        let response = Helper.leftKeys(user.toJSON(), keys);
        response.unreadMessages = unreadMessages;
        response.friendRequests = JSON.parse(response.requestsFrom).length;
        response.friendsCount = JSON.parse(response.friends).length;
        delete response.friends;
        delete response.requestsFrom;
        return response;
    }
    
}

module.exports.Formatter = Formatter;