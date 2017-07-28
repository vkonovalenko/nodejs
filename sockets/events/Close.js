"use strict";

class Close {
    
    static handle(msg) {
        if (Helper.isVar(this.user_id)) {
            let ws = Socket.clients(this.user_id);
            Socket.sendToFriends(ws, 'online_status', {id: this.user_id, status: false});
            App.geo().removeLocation(this.user_id);
            Socket.del(this.user_id);
        }
    }
    
}

module.exports.Close = Close;