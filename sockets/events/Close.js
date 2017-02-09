"use strict";

class Close {
    
    static handle(msg) {
        console.log(Socket.clients());
        if (Helper.isVar(this.user_id)) {
            App.geo().removeLocation(this.user_id);
            Socket.del(this.user_id);
        }
        console.log(Socket.clients());
    }
    
}

module.exports.Close = Close;