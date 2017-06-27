"use strict";

class CreateUser {

    handle(data, ws) {
        
        let lang = 'ru';
        if (data.lang) {
            lang = data.lang;
        }
        App.i18n().setLocale(lang);
        
        return new Promise(function (resolve, reject) {
            let errors = [];
            if (!data.deviceOs || (data.deviceOs !== 'android' && data.deviceOs !== 'ios')) {
                errors.push(__('device_os_error'));
            }
            if (!data.firstName) {
                errors.push(__('first_name_empty'));
            }
            if (!data.nickName) {
                errors.push(__('nickname_empty'));
            }
            if (!data.password) {
                errors.push(__('password_too_short'));
            } else {
                if (data.password.length <= 2) {
                    errors.push(__('password_empty'));
                }
            }
            if (!data.email) {
                errors.push(__('email_empty'));
            } else {
                
//                if (!App.validator().isEmail(data.email)) {
                let emailReg = new RegExp(Config.get('email_pattern'));
                if (!emailReg.test(data.email)) {
                    errors.push(__('email_format_incorrect'));
                }
            }
            if (errors.length === 0) {
                Model.get('User').count({where: {nickName: data.nickName}}).then(function (count) {
                    if (count <= 0) {
                        Model.get('User').count({where: {email: data.email}}).then(function (count2) {
                            if (count2 <= 0) {
                                resolve(true);
                            } else {
                                ws.send(Response.socket('signup_error', {}, __('email_taken')));
                                reject();
                            }
                        });
                    } else {
                        ws.send(Response.socket('signup_error', {}, __('nickname_taken')));
                        reject();
                    }
                });
            } else {
                ws.send(Response.socket('signup_error', {}, errors.pop()));
                reject();
            }
        });
    }

}

module.exports.CreateUser = CreateUser;