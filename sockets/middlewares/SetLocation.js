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