"use strict";

class SetLocation {

    handle(data, ws) {
        return new Promise(function (resolve, reject) {
            let distance = "";
            console.log('1___DISTANCE');
            if (data.lon && data.lat) {
                console.log('2___DISTANCE');
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
                            let friendOnline = null;
                            ws.friends.forEach(function (item, k) {
                                /**
                                 * @TODO: add check for hidden friends and for the too big distance
                                 */
                                App.geo().distance(ws.user_id, item, function (err, location) {
                                    if (!err) {
                                        friendOnline = Socket.clients(item);
                                        if (friendOnline) {
                                            
                                            distance = parseInt(location, 10);
                                            distance = (isNaN(distance) || distance == 'NaN') ? "" : distance;
											
											if(distance && distance > 0 && distance <= parseInt(ws.pushRadius, 10)) {
												Socket.friendNearPush(ws.user_id, friendOnline.user_id, distance);
											}
											
//											Socket.friendNearPush(ws.user_id, client.user_id, item.distance);
											
                                            if (distance != "") {
                                                distance = App.formatter().distance(distance);
                                            }
                                            friendOnline.send(Response.socket('online_status', {id: ws.user_id, status: true, distance: distance}));
                                        }
                                    }
                                });
                            });
                        } else {
                            console.log(ws.friends);
                        }

                        // send notification to user if he has appeared near
//                        let client = null;
//                        App.geo().nearby(coords, parseInt(ws.pushRadius, 10), {
//                            withDistances: true
//                        }, function (err, locations) {
//                            if (!err) {
//                                if (locations.length > 0) {
//                                    locations.forEach(function (item, k) {
//                                        client = Socket.clients(item.key);
//                                        if (client) {
//                                            if (parseInt(item.key, 10) !== parseInt(ws.user_id, 10)) { // remove own user_id
//                                                if (ws.friends.length && Helper.inArray(item.key, ws.friends) && client.allowFriends) {
////                                                    Socket.friendNearPush(ws.user_id, client.user_id, item.distance);
//                                                }
//                                            }
//                                        }
//                                    });
//                                }
//                            } else {
//								console.log('ERROR: ');
//								console.log(err);
//							}
//                        });
                        // ------------
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