/*
 * Sockets
 */
const routes = {
    signup: 'SocketsController.signup',
    login: 'SocketsController.login',
    unread_messages: 'SocketsController.unreadMessages',
    message: 'SocketsController.message',
    profile: 'SocketsController.getProfile',
    friends: 'SocketsController.friends',
    request_meeting: 'SocketsController.requestMeeting',
    discard_meeting: 'SocketsController.discardMeeting',
    approve_meeting: 'SocketsController.approveMeeting',

    update_profile: 'SocketsController.updateProfile',
    set_location: 'SocketsController.setLocation',
    get_locations: 'SocketsController.getLocations',
    save_files: 'SocketsController.saveFiles',
    add_friend: 'SocketsController.addFriend',
    ping: 'SocketsController.ping'
};

const middlewares = {
    signup: ['CreateUser'],
    unread_messages: ['Auth'],
    message: ['Auth'],
    profile: ['Auth'],
    friends: ['Auth'],
    request_meeting: ['Auth'],
    discard_meeting: ['Auth'],
    approve_meeting: ['Auth'],
    
    update_profile: ['Auth'],
    set_location: ['Auth'],
    get_locations: ['Auth'],
    save_files: ['Auth'],
    add_friend: ['Auth'],
    ping: ['Auth']
};

const events = {
    message: 'Message',
    connection: 'Connection',
    close: 'Close',
    error: 'Error'
};

module.exports.routes = routes;
module.exports.events = events;
module.exports.middlewares = middlewares;