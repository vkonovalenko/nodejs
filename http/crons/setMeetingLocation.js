let schedule = require('node-schedule');

schedule.scheduleJob(Config.get('cron_users_meeting'), function () {
    let client1 = null;
    let client2 = null;
    Model.get('Meeting').findAll({where: {status: 1}}).then(function(meetings) {
        meetings.forEach(function (meeting, k) {
            client1 = Socket.clients(meeting.userFrom);
            client2 = Socket.clients(meeting.userTo);
            if (Date.now() <= (new Date(meeting.expiredAt)).getTime()) {
                if (client1 && client2) {
                    Response.socket(client1, 'do_meeting', {});
                    Response.socket(client2, 'do_meeting', {});
                }
            } else {
                Model.get('Meeting').update({status: 4}, {where: {id: meeting.id}});
                if (client1) {
                    Response.socket(client1, 'meeting_expired', {meetingId: meeting.id});
                }
                if (client2) {
                    Response.socket(client2, 'meeting_expired', {meetingId: meeting.id});
                }
            }
        });
    });
});