/*
 * Http
 */
const routes = [
    {
        url: '/users/upload_photo',
        handler: 'UserController.uploadPhoto'
    }
];

const middlewares = {
    '/users/upload_photo': ['Auth'],
};

module.exports.routes = routes;
module.exports.middlewares = middlewares;