"use strict";

class Connection {
    
    static handle(ws) {
        ws.send('{"action": "on connect"}');
    }
    
}

module.exports.Connection = Connection;