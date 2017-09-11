"use strict";

class SetLocation {

    handle(data, ws) {
        return new Promise(function (resolve, reject) {
            let distance = "";
            if (data.lon && data.lat) {
                /**
                 * @TODO: add check for coords format
                 */
                const coords = {
                    latitude: data.lat,
                    longitude: data.lon
                };
                App.geo().removeLocation(ws.user_id);
                App.geo().addLocation(ws.user_id, coords, function (err, reply) {
                    if (!err) {
                        Socket.update(ws.user_id, {lat: coords.latitude, lon: coords.longitude});

                        if (ws.friends.length) {
							
							let async = require('async');
							function formatDistance(item, callback) {
								process.nextTick(function () {
									App.geo().distance(ws.user_id, item, function (err, location) {
										if (!err) {
											let friendOnline = Socket.clients(item);
											if (friendOnline) {

												distance = parseInt(location, 10);
												distance = (isNaN(distance) || distance == 'NaN') ? "" : distance;

												// send notification to user if he has appeared near
												if(distance && distance > 0 && distance <= parseInt(ws.pushRadius, 10)) {
													Socket.friendNearPush(ws.user_id, friendOnline.user_id, distance);
												}

												if (distance != "") {
													distance = App.formatter().distance(distance);
												}
												Response.socket(friendOnline, 'online_status', {id: ws.user_id, status: true, distance: distance});
												
												callback(null, item);
											} else {
												callback(null, item);
											}
										} else {
											callback(null, item);
										}
									});
									
								});
							}

							async.map(ws.friends, formatDistance);
							
                        } else {
                            console.log(ws.friends);
                        }

                        resolve(true);
                    } else {
                        reject();
                    }
                });
            } else {
                reject();
            }
        });
    }

}

module.exports.SetLocation = SetLocation;