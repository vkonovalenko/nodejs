"use strict";

const settings = {
	port: 8002,
	
	time_online_expires: 180000, //180 sec, addition 000 cuz miliseconds
	meeting_expired: 1800000, // 30 min
	near_push_expired: 60,
//	near_push_expired: 10800, // 3 hours (cuz seconds)
        push_radius_default: 900, // in meters
        
	redis_coordinates_table: 'user:locations',
	redis_dates_table: 'user_times', //zset for in format (ID => timestamp) to store user ping timestamp
	
        meeting_complete_meters: 15,
        
	cron_users_online: '0 * * * * *', // every minute
	cron_users_set_location: '/20 * * * * *', // every minute
//	cron_users_meeting: '*/3 * * * * *', // every 3 seconds
	cron_users_meeting: '* 20 * * * *', // every hour
	
	locale_default: 'ru',
	locale_values: ['ru', 'en'],
	locale_directory: './resources/lang',
	
//	limit_req_per_second: 20
	limit_req_per_second: 200000,
        salt: '%$Er^b5#s%$*(^$E#*'
};

module.exports.settings = settings;