"use strict";

class Response {
    
    static socket(command, data, message) {
        if (Helper.isNo(message)) {
            message = '';
        }
        const send_data = {
            command: command,
            data: data,
            message: message
        };
        return JSON.stringify(send_data);
    }
    
    static http(data, command, message ) {
        if (Helper.isNo(command)) {
            command = '';
        }
        if (Helper.isNo(message)) {
            message = '';
        }
        return {
            command: command,
            data: data,
            message: message
        };
    }
}

module.exports.Response = Response;