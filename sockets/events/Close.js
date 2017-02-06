"use strict";

class Close {
    
    static handle(msg) {
        if (Helper.isVar(this.user_id)) {
            App.geo().removeLocation(this.user_id);
            Socket.del(this.user_id);
        }
    }
    
}

module.exports.Close = Close;