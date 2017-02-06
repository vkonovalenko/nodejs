let schedule = require('node-schedule');

schedule.scheduleJob(Config.get('cron_users_set_location'), function () {
    Object.keys(Socket.clients()).forEach(function(user_id) {
        Socket.clients(user_id).send('{"action": "do_set_location"}');
//        CLIENTS[user_id].send('{"action": "do_set_location"}');
    });
});