"use strict";

let User = require(__root_dir + '/models/User').User;

const Auth = function (req, res, next) {
    req = req.body;
    if (Helper.isVar(req.api_token)) {
        User.findOne({
          where: {token: req.api_token}
        }).then(function(user) {
            if(user) {
                next();
            } else {
                res.send(Response.http({}, 'do_login', 'Неправильный логин или пароль.'));
            }
        });
    } else {
        res.send(Response.http({}, 'do_login', 'Неправильный логин или пароль.'));
    }
};


module.exports.Auth = Auth;