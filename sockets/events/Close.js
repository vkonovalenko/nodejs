"use strict";

var moment = require("moment");

class Close {
    
    static handle(msg) {
        if (Helper.isVar(this.user_id)) {
            let ws = Socket.clients(this.user_id);
			
			var now = moment();
			const dateFormatted = now.format('YYYY-MM-DD HH:mm:ss');
			
            Socket.sendToFriends(ws, 'online_status', {id: this.user_id, status: false, wasOnline: dateFormatted});
            App.geo().removeLocation(this.user_id);
            Socket.del(this.user_id);
			
			Model.get('User').update({wasOnline: dateFormatted}, {where: {id: this.user_id}});
        }
    }
    
}

module.exports.Close = Close;