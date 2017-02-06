"use strict";

class Message {
    
    static handle(msg) {
        return Message.getJsonData(msg);
    }
    
    static getJsonData(msg) {
        if (Helper.isJson(msg)) {
            return JSON.parse(msg);
        } else {
            return false;
        }
    }
    
}

module.exports.Message = Message;