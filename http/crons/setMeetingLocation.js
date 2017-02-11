let schedule = require('node-schedule');

schedule.scheduleJob(Config.get('cron_users_meeting'), function () {
    let client1 = null;
    let client2 = null;
    Model.get('Meeting').findAll({where: {status: 1}}).then(function(meetings) {
        meetings.forEach(function (meeting, k) {
            client1 = Socket.clients(meeting.userFrom);
            client2 = Socket.clients(meeting.userTo);
            if (client1 && client2) {
                client1.send(Response.socket('do_set_location', {}));
                client2.send(Response.socket('do_set_location', {}));
            }
        });
    });
});