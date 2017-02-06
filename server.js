"use strict";

global.__root_dir = __dirname;
global.Helper = require('./helpers/Helper').Helper;
global.Config = require('./helpers/Config').Config;
global.Response = require('./helpers/Response').Response;
global.Socket = require('./sockets/helpers/Socket').Socket;

const App = require('./helpers/App').App;
App.init();
App.i18n().setLocale('ru');

global.App = App;
global.Seq = App.Sequelize();

/*
 * App Middlewares
 */
require('./http/middlewares/app/Cors.js');
require('./http/middlewares/app/Limiter.js');
require('./http/middlewares/app/BodyParser.js');
require('./http/middlewares/app/FileUpload.js');

/*
 * Crons
 */
require('./http/crons/updateUsersOnline');
require('./http/crons/setLocationRequest');

/*
 * Listen port
 */
App.listen();
