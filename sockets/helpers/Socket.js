"use strict";

class Socket {
    
//    static clients = [];
    
    static add(client) {
        if (Helper.isVar(client.user_id)) {
            Socket.clients[client.user_id] = client;
        }
    }
    
    static del(client_id) {
        if (Helper.isVar(client_id) && Helper.isVar(Socket.clients[client_id])) {
            delete(Socket.clients[client_id]);
        }
    }
    
    static clients(client_id) {
        if (Helper.isVar(client_id) && client_id) {
            if (Helper.isVar(Socket.clients[client_id])) {
                return Socket.clients[client_id];
            } else {
                return null;
            }
        } else {
            return Socket.clients;
        }
    }
    
    static update(client_id, data) {
        Object.keys(data).forEach(function(key) {
            Socket.clients[client_id][key] = data[key];
        });
    }
    
    static isLogined(client) {
        if (Helper.isVar(client.user_id) && Socket.clients(client.user_id) !== null) {
            return true;
        } else {
            return false;
        }
    }
    
    static authorize(ws, user) {
        if (Helper.isVar(ws.user_id)) {
            delete(Socket.clients[ws.user_id]);
        }
        let friendsCount = 0;
        if (user.friends) {
            friendsCount = user.friends.length;
        }
        ws.user_id = user.id;
        ws.avatar = user.avatar;
        ws.phone = user.phone;
        ws.email = user.email;
        ws.nickName = user.firstName;
        ws.firstName = user.firstName;
        ws.lastName = user.lastName;
        ws.friends = user.friends;
        ws.friendsCount = friendsCount;
        ws.requestsFrom = user.requestsFrom;
        ws.requestsTo = user.requestsTo;
        ws.allowFriends = user.allowFriends;
        ws.allowRandom = user.allowRandom;
        ws.meetsCount = user.meetsCount;
        ws.wasOnline = user.wasOnline;
        Socket.clients[user.id] = ws;
    }
}

module.exports.Socket = Socket;