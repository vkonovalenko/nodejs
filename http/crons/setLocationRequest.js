let schedule = require('node-schedule');

schedule.scheduleJob(Config.get('cron_users_set_location'), function () {
    const clients = Socket.clients();
    let loginedClient = null;
    if (clients) {
        Object.keys(clients).forEach(function(user_id) {
            loginedClient = Socket.clients(user_id);
            if (loginedClient) {
                loginedClient.send('{"action": "do_set_location"}');
            }
        });
    }
});