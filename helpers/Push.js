"use strict";

class Push {
    
    static __config() {
        return require(__root_dir + '/config/pushes').pushes;
    }
    
    static __init() {
        const PushNotifications = new require('node-pushnotifications');
        return new PushNotifications(Push.__config());
    }
    
    static send(user, data) {
		console.log('_________TRY TO SEND PUSH');
        if (user.deviceOs === 'android' && user.pushToken) {
            Push.__sendAndroid(data, user.pushToken);
        } else if (user.deviceOs === 'ios') {
            Push.__sendIos(data, user.pushToken);
        }
    }
    
    static __sendIos(data, deviceToken) {
        const push = Push.__init();
        push.send([deviceToken], data, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    }
    
    static __sendAndroid(data, deviceToken) {
        const push = Push.__init();
        push.send([deviceToken], data, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    }
}

module.exports.Push = Push;