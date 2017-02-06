"use strict";

let User = require(__root_dir + '/models/User').User;

class Auth {
    
    handle(data, ws) {
        return new Promise(function(resolve, reject) {
            if (Socket.isLogined(ws)) {
                resolve(true);
            } else {
                if (Helper.isVar(data.api_token)) {
                    User.findOne({
                      where: {token: data.api_token}
                    }).then(function(user) {
                        if(user) {
                            Socket.authorize(ws, user);
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