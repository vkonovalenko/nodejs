"use strict";

/* global App, Model, Helper, Socket, Response */

class SocketsController {
    
    static getProfile(ws, data) {
        Model.get('UserMessage').count({where: {userTo: ws.user_id, isDelivered: false}}).then(function(count) {
            let response = App.formatter().userProfile(ws, count);
            ws.send(Response.socket('profile', response));
        });
    }
    
    static updateProfile(ws, data) {
        let updateData = {};
        const keys = ['firstName', 'lastName', 'allowFriends', 'allowRandom', 'phone', 'deviceOs'];
        updateData = Helper.leftKeys(data, keys);
        if (data.password) {
            updateData.password = App.sha1(data.password);
        }
        if (Object.keys(updateData).length > 0) {
            Model.get('User').update(updateData, {where: {id: ws.user_id}}).then(function(user) {
                Socket.update(ws.user_id, updateData);
                ws.send(Response.socket('profile_updated', App.formatter().userProfile(ws, 0)));
            }, function(err) {
                ws.send(Response.socket('update_profile_error', {}, __('update_profile_error')));
            });
        }
    }
    
    static message(ws, data) {
        if (Helper.checkParams(data, ['message', 'userTo'])) {
            const messageText = data.message;
            const userTo = data.userTo;
            if (ws.user_id != userTo) {
                Model.get('User').count({id: userTo}).then(function(count) {
                    // make check for blocking
                    if (count) {
                        const receiver = Socket.clients(userTo);
                        const isDelivered = Socket.isLogined(receiver);
                        Model.get('UserMessage').create({
                            message: messageText,
                            userFrom: ws.user_id,
                            userTo: userTo,
                            isDelivered: isDelivered
                        }).then(function(message) {
                            ws.send(Response.socket('message_sent', {}));
                            if (isDelivered) {
                                const keys = ['id', 'message', 'createdAt'];
                                let response = Helper.leftKeys(message.toJSON(), keys);
                                response.sender = {id: ws.user_id, nickName: ws.nickName, avatar: ws.avatar};
                                receiver.send(Response.socket('recieve_message', response));
                            }
                        });
                    }
                });
            }
        } else {
            console.log('message error');
        }
    }
    
    static setLocation(ws, data) {
        ws.send(Response.socket('coords_setted', {}));
    }
    
    static getLocations(ws, data) {
        if (data.radius) {
            const coords = {
                    latitude: data.lat,
                    longitude: data.lon
            };
            // @TODO: add check for radius
            const radius = data.radius;

            App.geo().nearby(coords, radius, {
                withDistances: true,
                withCoordinates: true,
                order: true
            }, function (err, locations) {
                if (!err) {
                    let friendsNear = [];
                    let randomPeople = [];
                    const length = locations.length;

                    let send_data = null;
                    let user = null;
                    let client = null;
                    // async, cuz "k >= length - 1"
                    if (length > 0) {
                        locations.forEach(function (item, k) {
                            if (parseInt(item.key, 10) !== parseInt(ws.user_id, 10)) { // remove own user id from both listings
//                                console.log(item.key);
                                client = Socket.clients(item.key);
                                if (client) {
                                    user = {
                                        id: item.key, //user_id
                                        nickName: client.nickName,
                                        distance: item.distance,
                                        avatar: client.avatar
                                        //item.latitude, item.longitude
                                    };
                                    // check for friends
                                    // user has friends and item.key(user_id) in friend list
                                    if (ws.friends.length && Helper.inArray(item.key, ws.friends)) {
                                        // if user allow friends to find him
                                        if (client.allowFriends) {
                                            friendsNear.push(user);
                                        }
                                        if (k >= length - 1) {
                                            send_data = {friendsNear: friendsNear, randomPeople: randomPeople};
                                            ws.send(Response.socket('people', send_data));
                                        }
                                    } else if (!Helper.inArray(item.key, ws.friends)) {
                                        // if user allow to find him from random mets
                                        if (client.allowRandom) {
                                            randomPeople.push(user);
                                        }
                                        if (k >= length - 1) {
                                            send_data = {friendsNear: friendsNear, randomPeople: randomPeople};
                                            ws.send(Response.socket('people', send_data));
                                        }
                                    }
                                } else {
                                    if (k >= length - 1) {
                                        send_data = {friendsNear: friendsNear, randomPeople: randomPeople};
                                        ws.send(Response.socket('people', send_data));
                                    }
                                }
                            } else {
                                if (k >= length - 1) {
                                    send_data = {friendsNear: friendsNear, randomPeople: randomPeople};
                                    ws.send(Response.socket('people', send_data));
                                }
                            }
                        });
                    } else {
                        ws.send(Response.socket('people', {friendsNear: [], randomPeople: []}));
                    }
                } else {
                    console.log('errror');
                }
            });
        }
    }
    
    static saveFiles(ws, data) {
        //redisClient...
        if (data.fileIds && data.fileIds.length) {
            let UploadedFile = require('../../models/UploadedFile').UploadedFile;
            UploadedFile.findAll({
                where: {id: data.fileIds}
            }).then(function (uploadedArr) {
                if (uploadedArr) {
                    console.log(uploadedArr);
                    Response.socket('files_saved', {});
                } else {
                    Response.socket('files_not_found', {});
                }
            });
        } else {
            Response.socket('file_ids_required', {});
        }
    }
    
    /*
     * 1. Получаем юзера(u2) по id, которого наш пользователь(u1) пытается добавить
     * 2. Проверяем забанил ли u2 пользователя u1
     * 3. Проверяем есть ли id пользователя u2 в списке requestsFrom пользователя u1
     * 3.1 Да:
     * Удаляем id пользователя u2 из requestsTo.
     * Добавляем id пользователя u1 в список friends пользователя u2.
     * Удаляем id пользователя u2 у пользователя u1 в ячейке requestsFrom.
     * Добавляем id пользователя u2 в список friends пользователя u1.
     * 3.2 Нет:
     * Добавляем пользователя u2 айдишник пользователя u1 в requestsFrom
     * Добавляем пользователя u1 айдишник пользователя u2 в requestsTo
     */
    
    static addFriend(ws, data) {
        if (data.friendId !== ws.user_id) {
            // a lot of different checks for ban etc
            Model.get('User').findOne({
                where: {id: data.friendId}
            }).then(function (user2) {
                const user2Client = Socket.clients(user2.id);
                const user1Data = {
                    id: ws.user_id,
                    nickName: ws.nickName,
                    avatar: ws.avatar
                };
                const user2Data = {
                    id: user2.id,
                    nickName: user2.nickName,
                    avatar: user2.avatar
                };
                if (user2) {
                    // user 2
                    let requestsTo = user2.requestsTo;
                    let requestsFrom = user2.requestsFrom;
                    let friends = ws.friends;
                    if (Helper.inArray(data.friendId, friends)) { // check maybe friend already exists
                        ws.send(Response.socket('friend_exists', {}));
                    // user 2 dont have request from user 1
                    } else if (!Helper.inArray(ws.user_id, requestsTo)) {
                        // user 1
                        requestsTo = ws.requestsTo;
                        if (!Helper.inArray(data.friendId, requestsTo)) {
                            requestsTo.push(data.friendId);
                            Model.get('User').update({requestsTo: Helper.getDbArray(requestsTo)}, {where: {id: ws.user_id}});
                            Socket.update(ws.user_id, {requestsTo: requestsTo});
                        }
                        // user 2
                        if (!Helper.inArray(ws.user_id, requestsFrom)) {
                            requestsFrom.push(ws.user_id);
                            Model.get('User').update({requestsFrom: Helper.getDbArray(requestsFrom)}, {where: {id: user2.id}});
                            if (user2Client) {
                                Socket.update(user2.id, {requestsFrom: requestsFrom});
                                user2Client.send(Response.socket('new_friend_request', user1Data));
                            }
                        }
                        ws.send(Response.socket('friend_requested', {}));
                    // user 2 already have request from user 1
                    } else {
                        console.log('success');
                        // update user 1 friends
                        let friends = ws.friends;
                        let index = 0;
                        if (!Helper.inArray(user2.id, friends)) {

                            index = requestsTo.indexOf(ws.user_id);
                            delete requestsTo[ index ];

                            index = requestsFrom.indexOf(ws.user_id);
                            delete requestsFrom[ index ];

                            friends.push(user2.id);

                            Model.get('User').update({
                                friends: Helper.getDbArray(friends),
                                requestsTo: Helper.getDbArray(requestsTo),
                                requestsFrom: Helper.getDbArray(requestsFrom)
                            }, {where: {id: ws.user_id}}).then(function(result) {
                                console.log('user 1 friends updated');
                                Socket.update(ws.user_id, {friends: friends, requestsTo: requestsTo, requestsFrom: requestsFrom});
                                ws.send(Response.socket('you_confirmed_friend', user2Data));
                            });
                        }
                        // update user 2 friends
                        friends = user2.friends;
                        if (!Helper.inArray(ws.user_id, friends)) {

                            requestsTo = ws.requestsTo;
                            requestsFrom = user2.requestsFrom;

                            index = requestsTo.indexOf(ws.user_id);
                            delete requestsTo[ index ];

                            index = requestsFrom.indexOf(ws.user_id);
                            delete requestsFrom[ index ];

                            friends.push(ws.user_id);

                            Model.get('User').update({
                                friends: Helper.getDbArray(friends),
                                requestsTo: Helper.getDbArray(requestsTo),
                                requestsFrom: Helper.getDbArray(requestsFrom)
                            }, {where: {id: user2.id}}).then(function(result) {
                                console.log('user 2 friends updated');
                                if (user2Client) {
                                    Socket.update(user2.id, {friends: friends, requestsTo: requestsTo, requestsFrom: requestsFrom});
                                    user2Client.send(Response.socket('user_confirmed_friend', user1Data));
                                }
                            });
                        }
                    }
                } else {
                    ws.send(Response.socket('user_id_not_found', {}));
                }
            });
        } else {
            ws.send(Response.socket('adding_self', {}));
        }
    }
    
    static deleteFriend(ws, data) {
        if (data.friendId !== ws.user_id) {
            Model.get('User').findOne({
                where: {id: data.friendId}
            }).then(function (user2) {
                const user2Client = Socket.clients(user2.id);
                let index = null;
                if (Helper.inArray(user2.id, ws.friends)) {
                    index = ws.friends.indexOf(user2.id);
                    if (index !== -1) {
                        delete ws.friends[index];
                        Model.get('User').update({
                            friends: Helper.getDbArray(ws.friends)
                        }, {where: {id: ws.user_id}}).then(function(result) {
                            Socket.update(ws.user_id, {friends: ws.friends});
                        });
                    }
                    
                    index = user2.friends.indexOf(ws.user_id);
                    if (index !== -1) {
                        delete user2.friends[index];
                        Model.get('User').update({
                            friends: Helper.getDbArray(user2.friends)
                        }, {where: {id: user2.id}}).then(function(result) {
                            Socket.update(user2.id, {friends: user2.friends});
                        });
                    }
                } else if(Helper.inArray(user2.id, ws.requestsFrom)) {
                    index = ws.requestsFrom.indexOf(user2.id);
                    if (index !== -1) {
                        delete ws.requestsFrom[index];
                        Model.get('User').update({
                            requestsFrom: Helper.getDbArray(ws.requestsFrom)
                        }, {where: {id: ws.user_id}}).then(function(result) {
                            Socket.update(ws.user_id, {requestsFrom: ws.requestsFrom});
                        });
                    }
                    
                    index = user2.requestsTo.indexOf(ws.user_id);
                    if (index !== -1) {
                        delete user2.requestsTo[index];
                        Model.get('User').update({
                            requestsTo: Helper.getDbArray(user2.requestsTo)
                        }, {where: {id: user2.id}}).then(function(result) {
                            Socket.update(user2.id, {requestsTo: user2.requestsTo});
                        });
                    }
                } else if(Helper.inArray(user2.id, ws.requestsTo)) {
                    index = ws.requestsTo.indexOf(user2.id);
                    if (index !== -1) {
                        delete ws.requestsTo[index];
                        Model.get('User').update({
                            requestsTo: Helper.getDbArray(ws.requestsTo)
                        }, {where: {id: ws.user_id}}).then(function(result) {
                            Socket.update(ws.user_id, {requestsTo: ws.requestsTo});
                        });
                    }
                    
                    index = user2.requestsFrom.indexOf(ws.user_id);
                    if (index !== -1) {
                        delete user2.requestsFrom[index];
                        Model.get('User').update({
                            requestsFrom: Helper.getDbArray(user2.requestsFrom)
                        }, {where: {id: user2.id}}).then(function(result) {
                            Socket.update(user2.id, {requestsFrom: user2.requestsFrom});
                        });
                    }
                }
            });
        }
    }
    
    static ping(ws, data) {
        if (Helper.checkParams(data, ['lat', 'lon', 'radius'])) {
            let coords = {
                latitude: data.lat,
                longitude: data.lon
            };
            console.log(ws.friends);
            // table "user:locations"
            App.geo().removeLocation(ws.user_id);
            App.geo().addLocation(ws.user_id, coords, function (err, reply) {
                if (!err) {
                    // "user_times" - time of last user ping in timestamp format
                    let args = ['user_times', Date.now(), ws.user_id];
                    App.redis().zrem('user_times', ws.user_id);
                    App.redis().zadd(args, function (err, resp) {
                        if (!err) {
                            App.geo().nearby(coords, data.radius, {
                                withDistances: true,
                                withCoordinates: true,
                                order: true
                            }, function (err, locations) {
                                if (!err) {
                                    let friendsNear = [];
                                    let randomPeople = [];
                                    const length = locations.length;
                                    const sendPeopleResponse = function (friendsNear, randomPeople) {
                                        ws.send(Response.socket('people', {friendsNear: friendsNear, randomPeople: randomPeople}));
                                    };
                                    locations.forEach(function (item, k) {
                                        if (parseInt(item.key, 10) !== parseInt(ws.user_id, 10)) { // remove own user id from both listings
                                            //is user's friend?
                                            if (ws.friends.length && Helper.inArray(item.key, ws.friends)) {
                                                App.redis().get('f_' + item.key, function (err, resp) {
                                                    if (!err && resp) {
                                                        friendsNear.push(item);
                                                        // console.log(friendsNear);
                                                    }
                                                    if (k >= length - 1) {
                                                        sendPeopleResponse(friendsNear, randomPeople);
                                                    }
                                                    // locations[k] = null; //free RAM
                                                    // it breaks our app!?
                                                });
                                            //is random person?
                                            } else if (!Helper.inArray(item.key, ws.friends)) {
                                                App.redis().get('r_' + item.key, function (err, resp) {
                                                    if (!err && resp) {
                                                        randomPeople.push(item);
                                                    }
                                                    if (k >= length - 1) {
                                                        sendPeopleResponse(friendsNear, randomPeople);
                                                    }
                                                });
                                            }
                                        } else {
                                            if (k >= length - 1) {
                                                sendPeopleResponse(friendsNear, randomPeople);
                                            }
                                        }
                                    });
                                } else {
                                    ws.send(Response.socket('error_get_locations', {}));
                                }
                            });
                        } else {
                            ws.send(Response.socket('error_set_timestamp', {}));
                        }
                    });
                } else {
                    ws.send(Response.socket('error_set_coords', {}));
                }
            });

            //5 - id of location in table "user:locations"
//            redisGeo.location(5, function (err, loc) {
//                console.log(loc);
//            });
        } else {
            ws.send(Response.socket('all_params_are_required', {}));
        }
    }
    
    static signup(ws, data) {
        App.db().sync().then(function() {
            const uuidV4 = require('uuid/v4');
            let keys = ['firstName', 'lastName', 'nickName', 'email', 'password', 'deviceOs'];
            let user = Helper.leftKeys(data, keys);
            user.token = uuidV4();
            user.password = App.sha1(user.password);
            return Model.get('User').create( user );
        }).then(function(user){
            user = user.toJSON();
            const keys = ['id', 'firstName', 'lastName', 'nickName', 'email', 'token', 'phone'];
            let response = Helper.leftKeys(user, keys);
            response.friends = [];
            response.allowFriends = true;
            response.allowRandom = true;
            response.meetsCount = 0;
            ws.send(Response.socket('user_created', response));
        }, function(error){
            console.log(error);
        });
    }
    
    static unreadMessages(ws, data) {
        let limit = 20;
        if (data.limit && data.limit > 0) {
            limit = data.limit;
        }
        let query = {
            attributes: ['id', 'message', 'createdAt'],
            where: {userTo: ws.user_id, isDelivered: false},
            limit: parseInt(limit, 10),
            order: 'createdAt ASC',
            include: [{
                model: Model.get('User'),
                as: 'sender',
                attributes: ['id', 'nickName', 'avatar']
            }]
        };
        Model.get('UserMessage').findAll(query).then(function(messages) {
            if (messages.length > 0) {
                // make it async
                delete query.include;
                delete query.attributes;
                Model.get('UserMessage').update({isDelivered: true}, query);
                let response = {};
                messages.forEach(function (message, k) {
                    response = message.toJSON();
                    ws.send(Response.socket('receive_message', response));
                });
            }
        });
    }
    
    static login(ws, data) {
        if (!data.password) {
            ws.send(Response.socket('login_error', {}, __('password_empty')));
        } else if (!data.nickName && !data.email) {
            ws.send(Response.socket('login_error', {}, __('email_or_nickname_required')));
        } else {
            let whereCond = data.nickName ? {nickName: data.nickName} : {email: data.email};
            Model.get('User').findOne({
                where: whereCond
            }).then(function (user) {
                if (user) {
                    const sha1 = require('sha1');
                    if (App.sha1(data.password) === user.password) {
                        Socket.authorize(ws, user);
                        Socket.sendToFriends(ws, 'friend_online', App.formatter().shortProfile(ws));
                        
                        Model.get('UserMessage').count({where: {userTo: user.id, isDelivered: false}}).then(function(count) {
                            let response = App.formatter().userProfile(user, count);
                            ws.send(Response.socket('user_logined', response));
                        });
                    } else {
                        ws.send(Response.socket('login_error', {}, __('incorrect_login_or_pass')));
                    }
                } else {
                    ws.send(Response.socket('login_error', {}, __('incorrect_login_or_pass')));
                }
            }, function(err) {
                console.log(err);
            });
        }
    }
    
    static friends(ws, data) {
        const friends = JSON.parse(ws.friends);
        if (friends.length) {
            // Фотка, замочек, был онлайн, никнейм
            // @TODO: sort by online and last message
            const query = {
                attributes: ['id', 'avatar', 'nickName', 'wasOnline'],
                where: {
                    id: {in: friends}
                },
                order: 'createdAt ASC'
            };
            Model.get('User').findAll(query).then(function(users) {
                let result = [];
                let formattedUser = {};
                users.forEach(function (user, k) {
                    formattedUser = user.toJSON();
                    formattedUser.isOnline = false;
                    formattedUser.isHidden = false;
                    if (Socket.clients(formattedUser.id)) {
                        formattedUser.isOnline = true;
                    }
                    if (Helper.isJson(ws.hiddenFriends)) {
                        let hiddenFriends = JSON.parse(ws.hiddenFriends);
                        if (Helper.inArray(formattedUser.id, hiddenFriends)) {
                            formattedUser.isHidden = true;
                        }
                    }
                    result.push(formattedUser);
                });
                ws.send(Response.socket('friends', {friends: result}));
            }, function(error) {
                console.log(error);
            });
        } else {
            ws.send(Response.socket('friends', {friends: []}));
        }
    }
    
    static requestMeeting(ws, data) {
        if (data.userId && data.userId !== ws.user_id) {
            let client = Socket.clients(data.userId);
            if (client) {
                const hiddenFriends = JSON.parse(client.hiddenFriends);
                console.log(1);
                if (!Helper.inArray(ws.user_id, hiddenFriends)) {
                    console.log(2);
                    const query = {
                        where: {
                            status: 1,
                            $or: [
                                {userFrom: ws.user_id, userTo: data.userId},
                                {userFrom: data.userId, userTo: ws.user_id}
                            ]
                        }
                    };
                    Model.get('Meeting').findOne(query).then(function (meeting) {
                        console.log(3);
                        if (!meeting) {
                            console.log(4);
                            const rawData = {
                                userFrom: ws.user_id,
                                userTo: data.userId
                            };
                            Model.get('Meeting').create(rawData).then(function (meeting) {
                                ws.send(Response.socket('meeting_requested', {meetingId: meeting.id, userTo: data.userId}));
                                client.send(Response.socket('request_meeting', {meetingId: meeting.id, userFrom: ws.user_id}));
                                client = null;
                            }, function (error) {
                                console.log(error);
                                // ошибка создания встречи в БД
                            });
                        } else {
                            ws.send(Response.socket('meeting_exists', {}, __('meeting_exists')));
                        }
                    });
                } else {
                    //юзер скрыл шаринг координат
                    ws.send(Response.socket('meeting_user_too_far', {}, __('meeting_user_too_far')));
                }
            } else {
                ws.send(Response.socket('meeting_user_offline', {}, __('meeting_user_offline')));
            }
        } else {
            console.log(5);
            // встреча с самим собой
        }
    }
	
    static discardMeeting(ws, data) {
        if (data.meetingId) {
            Model.get('Meeting').findOne({where: {id: data.meetingId, status: [0, 1]}}).then(function(meeting) {
                if (meeting) {
                    if (meeting.userFrom === ws.user_id || meeting.userTo === ws.user_id) {
                        // async update
                        Model.get('Meeting').update({status: 3}, {where: {id: meeting.id}});
                        ws.send(Response.socket('you_discarded_meeting', {meetingId: meeting.id}));
                        const clientId = (meeting.userFrom === ws.user_id) ? meeting.userTo : meeting.userFrom;
                        let client = Socket.clients(clientId);
                        if (client) {
                            client.send(Response.socket('meeting_discarded', {meetingId: meeting.id}));
                        } else {
                            // push notification
                        }
                        meeting = null;
                    }
                } else {
                    ws.send(Response.socket('meeting_not_found', {}));
                }
            });
        }
    }
    
    static approveMeeting(ws, data) {
        if (data.meetingId) {
            Model.get('Meeting').findOne({where: {id: data.meetingId, status: 0}}).then(function(meeting) {
                if (meeting) {
                    if (ws.user_id === meeting.userTo) {
                        let date = new Date(Date.now() + Config.get('meeting_expired'));
                        let expiredAt = date.toISOString().slice(0, 19).replace('T', ' ');
                        // async update
                        Model.get('Meeting').update({status: 1, expiredAt: expiredAt}, {where: {id: meeting.id}});
                        ws.send(Response.socket('you_approved_meeting', {meetingId: meeting.id}));
                        const clientId = (meeting.userFrom === ws.user_id) ? meeting.userTo : meeting.userFrom;
                        let client = Socket.clients(clientId);
                        if (client) {
                            client.send(Response.socket('meeting_approved', {meetingId: meeting.id}));
                        } else {
                            // push notification
                        }
                    }
                }
            });
        }
    }
    
    static meetings(ws, data) {
        let query = {
            where: {
                status: [0, 1],
                $or: [
                    {userFrom: ws.user_id},
                    {userTo: ws.user_id}
                ]
            },
            include: [
                { model: Model.get('User'), as: 'sender', attributes: ['id', 'nickName', 'avatar'] },
                { model: Model.get('User'), as: 'receiver', attributes: ['id', 'nickName', 'avatar'] }
            ],
            order: 'createdAt DESC'
        };
        Model.get('Meeting').findAll(query).then(function(meetings) {
            let formatted = [];
            if (meetings) {
                let myRequest = false;
                let result = {};
                let expiredAt = 0;
                let timeLeft = 0;
                meetings.forEach(function(meeting, key) {
                    myRequest = (meeting.userFrom === ws.user_id);
                    if (myRequest) {
                        result.user = meeting.receiver.toJSON();
                    } else {
                        result.user = meeting.sender.toJSON();
                    }
                    expiredAt = parseInt((new Date(meeting.expiredAt)).getTime() / 1000, 10);
                    timeLeft = expiredAt - parseInt(Date.now() / 1000, 10);
                    if (timeLeft < 0) {
                        timeLeft = 0;
                    }
                    result.myRequest = myRequest;
                    result.id = meeting.id;
                    result.expiredAt = expiredAt;
                    result.timeLeft = timeLeft;
                    formatted.push(result);
                });
            }
            ws.send(Response.socket('meetings', {meetings: formatted}));
        });
    }
    
    static doMeeting(ws, data) {
        const query = {
            where: {
                status: 1,
                $or: [
                    {userFrom: ws.user_id},
                    {userTo: ws.user_id}
                ]
            },
            include: [
                { model: Model.get('User'), as: 'sender', attributes: ['id', 'nickName', 'avatar'] },
                { model: Model.get('User'), as: 'receiver', attributes: ['id', 'nickName', 'avatar'] }
            ]
        };
		
		// App.geo().distance(userId1, userId2, function() {});
		
        let clientId = null;
        Model.get('Meeting').findAll(query).then(function(meetings) {
            if (meetings) {
                let users = [];
                let user = {};
                meetings.forEach(function(meeting, key) {
                    clientId = (meeting.userFrom === ws.user_id) ? meeting.userTo : meeting.userFrom;
                    App.geo().location(clientId, function(err, location) {
                        if (!err) {
                            if (location) {
                                if (meeting.userFrom === ws.user_id) {
                                    user = meeting.receiver.toJSON();
                                } else {
                                    user = meeting.sender.toJSON();
                                }
                                user.lat = location.latitude;
                                user.lon = location.longitude;
                                users.push(user);
                                if (!meeting[key + 1]) {
                                    ws.send(Response.socket('meeting_users', {users: users}));
                                }
                            } else {
                                console.log('location not set.');
                            }
                        }
                    });                
                });
            } else {
                ws.send(Response.socket('meeting_users', {users: []}));
            }
        });
    }
    
}

module.exports.SocketsController = SocketsController;

/*
 * meeting statuses:
 * 0 - meeting request
 * 1 - meeting approved
 * 2 - meeting success
 * 3 - meeting discarded
 * 4 - meeting expired
*/

/*
 * REQUESTS:
 * 
 * {"command": "profile", "data": {"api_token": "1"}}
 * 
 * 1)
 * {"command": "signup", "data": {"firstName": "slavik", "lastName": "konovalenko", "email": "slavik@ko.com", "password": "123", "nickName": "koslavik", "deviceOs": "android"}}
 * {"command":"user_created","data":{"id":12,"firstName":"slavik","lastName":"konovalenko","email":"slavik@ko.com","nickName":"koslavik","token":"641faa16-6ba0-4418-8b4a-481a09ecf8c4","friends":[],"allowFriends":true,"allowRandom":true,"meetsCount":0},"message":""}
 * 
 * 2)
 * {"command": "login", "data": {"password": "123", "nickName": "koslavik"}}
 * {"command":"user_logined","data":{"id":15,"token":"a039c628-de08-4278-b339-ffd0ac68dbdb","email":"slavik@ko.com","firstName":"slavik","lastName":"konovalenko","nickName":"koslavik","allowFriends":1,"allowRandom":1,"meetsCount":0,"unreadMessages":1},"message":""}
 * 
 * 3)
 * {"command": "unread_messages", "data": {"limit": "1"}}
 * {"command":"receive_message","data":{"id":53,"message":"hello user 6","createdAt":"2017-01-28T21:34:36.000Z","sender":{"id":5,"avatar":"/asd/image.jpg"}},"message":""}
 * 
 * 4)
 * {"command": "message", "data": {"message": "hello, user", "userTo": "15"}}
 * {"command":"message_sent","data":{},"message":""}
 * {"command":"recieve_message","data":{"id":67,"message":"whosg iguwuwge","createdAt":"2017-02-05T20:39:13.000Z","sender":{"id":5,"nickName":"11","avatar":""}},"message":""}
 * 
 * 5)
 * {"command": "profile"}
 * {"command":"profile","data":{"firstName":"Vyacheslav","lastName":"konovalenko","nickName":"Vyacheslav","email":"slavik@ko.com","allowFriends":1,"allowRandom":1,"meetsCount":0,"avatar":"/asd/test.jpg","phone":null,"unreadMessages":4,"friendRequests":0,"friendsCount":0},"message":""}
 * 
 * 6)
 * {"command": "update_profile", "data": {"firstName": "Vyacheslav"}}
 * {"command":"profile_updated","data":{"firstName":"Vyacheslav","lastName":"konovalenko","nickName":"slavik","email":"slavik@ko.com","allowFriends":1,"allowRandom":1,"meetsCount":0,"avatar":"/asd/test.jpg","phone":null,"unreadMessages":0,"friendRequests":0,"friendsCount":0},"message":""}
 * 
 * 7)
 * {"command": "friends"}
 * {"command":"friends","data":{"friends":[{"id":6,"avatar":null,"nickName":"22","wasOnline":null,"isOnline":false,"isHidden":true},{"id":5,"avatar":null,"nickName":"11","wasOnline":null,"isOnline":false,"isHidden":false}]},"message":""}
 * 
 * 8)
 * {"command": "request_meeting", "data": {"userId": "5"}}
 * {"command":"meeting_user_offline","data":{},"message":"Пользователь для встречи оффлайн."}
 * {"command":"meeting_requested","data":{"meetingId":2, "userTo": 5},"message":""}
 * {"command":"request_meeting","data":{"meetingId":2,"userFrom":15},"message":""}
 * 
 * 9)
 * {"command": "discard_meeting", "data": {"meetingId": "2"}}
 * {"command":"you_discarded_meeting","data":{"meetingId":2},"message":""}
 * {"command":"meeting_discarded","data":{"meetingId":2},"message":""}
 * 
 * 10)
 * {"command": "approve_meeting", "data": {"meetingId": "2"}}
 * {"command":"you_approved_meeting","data":{"meetingId":2},"message":""}
 * {"command":"meeting_approved","data":{"meetingId":2},"message":""}
 * 
 * 11)
 * response
 * {"command":"do_set_location","data":{},"message":""}
 * 
 * 12)
 * {"command": "meetings"}
 * {"command":"meetings","data":{"meetings":[{"user":{"id":15,"nickName":"koslavik","avatar":"/asd/test.jpg"},"myRequest":false,"id":2,"expiredAt":1486850318,"timeLeft":0}]},"message":""}
 * 
 * 13)
 * {"command": "do_meeting", "data": {"lat": "0.94501375303344304", "lon": "0.99999994039535522"}}
 * {"command":"meeting_users","data":{"users":[{"id":5,"nickName":"11","avatar":null,"lat":"1.50000108975534374","lon":"1.20000153779983521"}]},"message":""}
 * 
 * 14)
 * {"command": "get_locations", "data": {"lat": "1.0", "lon": "1.0", "radius": "900"}}
 * {"command":"people","data":{"friendsNear":[{"id":"5","nickName":"asd","distance":3336.8358,"avatar":null}],"randomPeople":[]},"message":""}
 * 
 * 15)
 * {"command": "add_friend", "data": {"friendId": "6"}}
 * {"command":"friend_requested","data":{},"message":""}
 * {"command":"new_friend_request","data":{"id":7,"nickName":"vpupkin","avatar":null},"message":""}
 * {"command":"user_confirmed_friend","data":{"id":6,"nickName":"koslavik","avatar":null},"message":""}
 */