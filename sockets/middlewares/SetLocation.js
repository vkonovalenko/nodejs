"use strict";

class SetLocation {

    handle(data, ws) {
        return new Promise(function (resolve, reject) {
            if (data.lon && data.lat) {
                if (App.validator().isFloat(data.lon) && App.validator().isFloat(data.lat)) {
                    const coords = {
                            latitude: data.lat,
                            longitude: data.lon
                    };
                    App.geo().removeLocation(ws.user_id);
                    App.geo().addLocation(ws.user_id, coords, function (err, reply) {
                        if (!err) {
                            Socket.update(ws.user_id, {lat: coords.latitude, lon: coords.longitude});
                            // send notification to user if he has appeared near
                            let client = null;
                            App.geo().nearby(coords, ws.pushRadius, {
                                withDistances: true
                            }, function (err, locations) {
                                if (!err) {
                                    if (locations.length > 0) {
                                        locations.forEach(function (item, k) {
                                            client = Socket.clients(item.key);
                                            if (client) {
                                                if (parseInt(item.key, 10) !== parseInt(ws.user_id, 10)) { // remove own user_id
                                                    if (ws.friends.length && Helper.inArray(item.key, ws.friends) && client.allowFriends) {
                                                        Socket.friendNearPush(ws.user_id, client.user_id, item.distance);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                            // ------------
                            resolve(true);
                        } else {
                            reject();
                        }
                    });
                } else {
                    reject();
                }
            } else {
                reject();
            }
        });
    }

}

module.exports.SetLocation = SetLocation;