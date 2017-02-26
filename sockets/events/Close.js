"use strict";

class Close {
    
    static handle(msg) {
        if (Helper.isVar(this.user_id)) {
            let ws = Socket.clients(this.user_id);
            Socket.sendToFriends(ws, 'friend_offline', App.formatter().shortProfile(ws));
            App.geo().removeLocation(this.user_id);
            Socket.del(this.user_id);
        }
    }
    
}

module.exports.Close = Close;