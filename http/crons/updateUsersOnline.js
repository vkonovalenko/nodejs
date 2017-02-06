"use strict";

let schedule = require('node-schedule');

schedule.scheduleJob(Config.get('cron_users_online'), function () {
    let expireTime = Date.now() - Config.get('time_online_expires'); //now - 3 minutes
    App.redis().zrangebyscore("user_times", 0, expireTime, function (err, reply) {
        if (!err) {
            if (reply.length > 0) {
                //user go offline
                reply.forEach(function (item) {
                    console.log('deleted: ' + item);
                    App.geo().removeLocation(item); //delete user location
                    App.redis().zrem('user_times', item); //delete user ping
//					redisClient.del('user_times', item); //delete user ping
                });
            }
        } else {

        }
//		console.log("expired users: \n");
//		console.log(reply);
    });
});