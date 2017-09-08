"use strict";

class Auth {
    
    handle(data, ws) {
        
        let lang = 'ru';
        if (data.lang) {
            lang = data.lang;
        }
        App.i18n().setLocale(lang);
        
		App.lang = lang;
		
		function updatePushToken(pushToken, user_id) {
			if (pushToken) {
				let moment = require("moment");
				let now = moment();
				const dateFormatted = now.format('YYYY-MM-DD HH:mm:ss');
				Model.get('User').update({pushToken: pushToken, wasOnline: dateFormatted}, {where: {id: user_id}});
			}
		}
		
        return new Promise(function(resolve, reject) {
            if (Socket.isLogined(ws)) {
				updatePushToken(data.pushToken, ws.user_id);
                resolve(true);
            } else {
                if (Helper.isVar(data.api_token)) {
                    Model.get('User').findOne({
                      where: {token: data.api_token}
                    }).then(function(user) {
                        if(user) {
                            Socket.authorize(ws, user);
                            Socket.sendToFriends(ws, 'friend_online', App.formatter().shortProfile(ws));
							updatePushToken(data.pushToken, user.id);
                            resolve(true);
                        } else {
                            ws.send('{"action": "do_login"}');
                            reject(false);
                        }
                    });
                } else {
                    ws.send('{"action": "do_login"}');
                    reject(false);
                }
            }
        });
    }
    
}

module.exports.Auth = Auth;