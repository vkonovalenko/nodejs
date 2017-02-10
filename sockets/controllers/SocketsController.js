"use strict";

/* global App, Model, Helper, Socket, Response */

class SocketsController {
    
    static getProfile(ws, data) {
        Model.get('UserMessage').count({where: {userTo: ws.user_id, isDelivered: 0}}).then(function(count) {
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
    
    static setLocation(ws, data, sendResponse) {
        return new Promise(function(resolve, reject) {
            if (Helper.checkParams(data, ['lat', 'lon'])) {
                // @TODO: add check for radius and coords
                const coords = {
                        latitude: data.lat,
                        longitude: data.lon
                };
                // table "user:locations"
                App.geo().removeLocation(ws.user_id);
                App.geo().addLocation(ws.user_id, coords, function (err, reply) {
                    if (!err) {
                        //ok
                        Socket.update(ws.user_id, {lat: coords.latitude, lon: coords.longitude});
                        if (sendResponse) {
                            const response = Response.socket('coords_setted', {});
                            ws.send(response);
                        }
                        resolve(true);
                    } else {
                        if (sendResponse) {
                            const response = Response.socket('coords_not_setted', {});
                            ws.send(response);
                            reject(false);
                        }
                    }
                });
            } else {
                console.log('incorrect coordinates data.');
                reject(false);
            }
        });
    }
    
    static getLocations(ws, data) {
        if (Helper.checkParams(data, ['lat', 'lon', 'radius'])) {
            Promise.all([SocketsController.setLocation(ws, data, false)]).then(function(result) {
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
                        let client = null;
                        // async, cuz "k >= length - 1"
                        if (length > 0) {
                            locations.forEach(function (item, k) {
                                if (parseInt(item.key, 10) !== parseInt(ws.user_id, 10)) { // remove own user id from both listings
                                    // check for friends
                                    // user has friends and item.key(user_id) in friend list
                                    user = {
                                        id: item.key, //user_id
                                        distance: item.distance
                                        //item.latitude, item.longitude
                                    };
                                    if (ws.friends.length && Helper.inArray(item.key, ws.friends)) {
                                        // if user allow friends to find him
                                        client = Socket.clients(item.key);
                                        if (client && client.allowFriends) {
                                            friendsNear.push(user);
                                        }
                                        if (k >= length - 1) {
                                            send_data = {friendsNear: friendsNear, randomPeople: randomPeople};
                                            ws.send(Response.socket('people', send_data));
                                        }
                                    } else if (!Helper.inArray(item.key, ws.friends)) {
                                        // if user allow to find him from random mets
                                        client = Socket.clients(item.key);
                                        if (client && client.allowRandom) {
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
                            });
                        } else {
                            ws.send(Response.socket('people', {friendsNear: [], randomPeople: []}));
                        }
                    } else {
                        console.log('errror');
                    }
                });
            }).catch(function(error){
                
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
    
    /*
     * @TODO: remove "getDbJson" and move db to postgres
     * @TODO: обновить данные в сокетах при обновлении (requestsTo и т.д.)
     */
    static addFriend(ws, data) {
        if (data.friendId !== ws.user_id) {
            // a lot of different checks for ban etc
            Model.get('User').findOne({
                where: {id: data.friendId}
            }).then(function (user2) {
                if (user2) {

                    // user 2
                    let requestsTo = getArray(user2.requestsTo);
                    let requestsFrom = getArray(user2.requestsFrom);
                    let friends = getArray(ws.friends);

                    if (Helper.inArray(data.friendId, friends)) { // check maybe friend already exists
                        ws.send(Response.socket('friend_exists', {}));
                    // user 2 dont have request from user 1
                    } else if (!Helper.inArray(ws.user_id, requestsTo)) {
                        // user 1
                        requestsTo = getArray(ws.requestsTo);
                        if (!Helper.inArray(data.friendId, requestsTo)) {
                            requestsTo.push(data.friendId);
                            Model.get('User').update({requestsTo: getDbJson(requestsTo)}, {where: {id: ws.user_id}});
                        }
                        // user 2
                        if (!Helper.inArray(ws.user_id, requestsFrom)) {
                            requestsFrom.push(ws.user_id);
                            Model.get('User').update({requestsFrom: getDbJson(requestsFrom)}, {where: {id: user2.id}});
                        }
                        ws.send(Response.socket('friend_added', {}));
                    // user 2 already have request from user 1
                    } else {
                        console.log('success');
                        // update user 1 friends
                        let friends = getArray(ws.friends);
                        let index = 0;
                        if (!Helper.inArray(user2.id, friends)) {

                            index = requestsTo.indexOf(ws.user_id);
                            delete requestsTo[ index ];

                            index = requestsFrom.indexOf(ws.user_id);
                            delete requestsFrom[ index ];

                            friends.push(user2.id);

                            Model.get('User').update({
                                friends: getDbJson(friends),
                                requestsTo: getDbJson(requestsTo),
                                requestsFrom: getDbJson(requestsFrom)
                            }, {where: {id: ws.user_id}}).then(function(result) {
                                console.log('user 1 friends updated');
                                // socket??
                            });
                        }
                        // update user 2 friends
                        friends = getArray(user2.friends);
                        if (!Helper.inArray(ws.user_id, friends)) {

                            requestsTo = getArray(ws.requestsTo);
                            requestsFrom = getArray(user2.requestsFrom);

                            index = requestsTo.indexOf(ws.user_id);
                            delete requestsTo[ index ];

                            index = requestsFrom.indexOf(ws.user_id);
                            delete requestsFrom[ index ];

                            friends.push(ws.user_id);

                            Model.get('User').update({
                                friends: getDbJson(friends),
                                requestsTo: getDbJson(requestsTo),
                                requestsFrom: getDbJson(requestsFrom)
                            }, {where: {id: user2.id}}).then(function(result) {
                                console.log('user 2 friends updated');
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
            user.friends = '[]';
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
                        
                        Model.get('UserMessage').count({where: {userTo: user.id, isDelivered: 0}}).then(function(count) {
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
    
	static createMeeting(ws, data) {
		console.log(5);
		if (data.userId && data.userId !== ws.user_id) {
			console.log(6);
			const client = Socket.clients(data.userId);
			if (client) {
				console.log(7);
				const hiddenFriends = JSON.parse(client.hiddenFriends);
				if (!Helper.inArray(ws.user_id, hiddenFriends)) {
					console.log(8);
					console.log(123);
					let query = {
						where: {
							status: 1,
							$or: [
								{userFrom: ws.user_id, userTo: data.userId},
								{userFrom: data.userId, userTo: ws.user_id}
							]
						}
					};
					
					Model.get('Meeting').findOne(query).then(function(meeting) {
						console.log(9);
						if (!meeting) {
							console.log(1);
							const rawData = {
								userFrom: ws.user_id,
								userTo: data.userId
							};
							Model.get('Meeting').create(rawData).then(function(meeting) {
								console.log(2);
								ws.send(Response.socket('meeting_created', {}));
							}, function(error) {
								console.log(3);
							});
						} else {
							console.log(4);
							// встреча уже существует.
						}
					}, function(error) {
						console.log(error);
					});
				} else {
					// вы не можете создать встречу, юзер слишком далеко
				}
			} else {
				
			}
		} else {
			console.log(10);
		}
	}
	
}

module.exports.SocketsController = SocketsController;

/*
 * REQUESTS:
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
 * 
 */