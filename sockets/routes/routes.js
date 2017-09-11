/*
 * Sockets
 */
const routes = {
    signup: 'SocketsController.signup',
    login: 'SocketsController.login',
    relogin: 'SocketsController.relogin',
    unread_messages: 'SocketsController.unreadMessages',
    message: 'SocketsController.message',
    profile: 'SocketsController.getProfile',
    friends: 'SocketsController.friends',
    friends_requests: 'SocketsController.friendsRequests',
    request_meeting: 'SocketsController.requestMeeting',
    discard_meeting: 'SocketsController.discardMeeting',
    approve_meeting: 'SocketsController.approveMeeting',
    meetings: 'SocketsController.meetings',
    do_meeting: 'SocketsController.doMeeting',
    set_location: 'SocketsController.setLocation',
    get_locations: 'SocketsController.getLocations',
    add_friend: 'SocketsController.addFriend',
    delete_friend: 'SocketsController.deleteFriend',

    update_profile: 'SocketsController.updateProfile',
    update_photos: 'SocketsController.updatePhotos',
    get_photos: 'SocketsController.getPhotos',
    set_avatar: 'SocketsController.setAvatar',
    update_password: 'SocketsController.updatePassword',
    update_profile_bool: 'SocketsController.updateProfileBool',
    save_files: 'SocketsController.saveFiles'
};

const middlewares = {
    signup: ['CreateUser'],
    unread_messages: ['Auth'],
    message: ['Auth'],
    profile: ['Auth'],
    friends: ['Auth'],
    friends_requests: ['Auth'],
    request_meeting: ['Auth'],
    discard_meeting: ['Auth'],
    approve_meeting: ['Auth'],
    meetings: ['Auth'],
    do_meeting: ['Auth', 'SetLocation'],
    set_location: ['Auth', 'SetLocation'],
    get_locations: ['Auth', 'SetLocation'],
    add_friend: ['Auth'],
    delete_friend: ['Auth'],
    
    update_profile: ['Auth'],
    update_photos: ['Auth'],
    get_photos: ['Auth'],
    set_avatar: ['Auth'],
    update_password: ['Auth'],
    update_profile_bool: ['Auth'],
    save_files: ['Auth'],
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