"use strict";

const pushes = {
    gcm: {
        id: null
    },
    apn: {
        token: {
            key: './certs/key.p8',
            keyId: 'ABCD',
            teamId: 'EFGH'
        }
    }
};

module.exports.pushes = pushes;