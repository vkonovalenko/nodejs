let schedule = require('node-schedule');

schedule.scheduleJob(Config.get('cron_users_set_location'), function () {
    const clients = Socket.clients();
	if (clients) {
		
		let async = require('async');
		function sendLocationRequest(user_id, callback) {
			process.nextTick(function () {
				let loginedClient = Socket.clients(user_id);
				if (loginedClient) {
					console.log(loginedClient);
					loginedClient.send('{"action": "do_set_location"}');
				}
				callback(null, user_id);
			});
		}
		async.map(Object.keys(clients), sendLocationRequest)
	}
});