let schedule = require('node-schedule');

schedule.scheduleJob(Config.get('cron_users_meeting'), function () {
    let client1 = null;
    let client2 = null;
    Model.get('Meeting').findAll({where: {status: 1}}).then(function(meetings) {
        meetings.forEach(function (meeting, k) {
            if (Date.now() <= (new Date(meeting.expiredAt)).getTime()) {
                client1 = Socket.clients(meeting.userFrom);
                client2 = Socket.clients(meeting.userTo);
                if (client1 && client2) {
                    client1.send(Response.socket('do_set_location', {}));
                    client2.send(Response.socket('do_set_location', {}));
                }
            } else {
                Model.get('Meeting').update({status: 4}, {where: {id: meeting.id}});
                client1 = Socket.clients(meeting.userFrom);
                client2 = Socket.clients(meeting.userTo);
                if (client1) {
                    client1.send(Response.socket('meeting_expired', {meetingId: meeting.id}));
                }
                if (client2) {
                    client2.send(Response.socket('meeting_expired', {meetingId: meeting.id}));
                }
            }
        });
    });
});