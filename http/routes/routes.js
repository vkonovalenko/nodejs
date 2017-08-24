/*
 * Http
 */
const routes = [
    {
        url: '/users/upload_photos',
        handler: 'UserController.uploadPhotos'
    }
];

const middlewares = {
	
};

module.exports.routes = routes;
module.exports.middlewares = middlewares;