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
	
};

module.exports.routes = routes;
module.exports.middlewares = middlewares;