"use strict";

const express = require('express');

global.__root_dir = __dirname;
global.Helper = require('./helpers/Helper').Helper;
global.Config = require('./helpers/Config').Config;
global.Response = require('./helpers/Response').Response;
global.Socket = require('./sockets/helpers/Socket').Socket;
global.Model = require('./helpers/Model').Model;

const App = require('./helpers/App').App;
App.init();
App.i18n();

global.App = App;
global.Seq = App.Sequelize();

/*
 * App Middlewares
 */
require('./http/middlewares/app/Cors.js');
require('./http/middlewares/app/Limiter.js');
require('./http/middlewares/app/BodyParser.js');

/*
 * Crons
 */
require('./http/crons/updateUsersOnline');
require('./http/crons/setLocationRequest');
require('./http/crons/setMeetingLocation');

console.log(__dirname + '/public/uploads');

App.appHttp().use(express.static(__dirname + '/public/uploads'));

/*
 * Listen port
 */
App.listen();
