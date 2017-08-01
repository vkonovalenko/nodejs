"use strict";

function App() {};

App.validator_module = null;
App.lang_module = null;
App.db_module = null;
App.sequelize_module = null;
App.events_module = null;
App.app_module = null;
App.express_ws_module = null;
App.handler_module = null;
App.redis_module = null;
App.redis_geo_module = null;
App.sha1_module = null;
App.formatter_module = null;
App.push_module = null;
App.lang = null;

App.init = function() {
    this.app();
    this.expressWs();
};

App.listen = function() {
    if (this.handler_module === null) {
        this.handler_module = require(__root_dir + '/handler').Handler;
    }
    this.handler_module.listenSockets();
    this.handler_module.listenHttp();
	
//    this.app().listen(Config.get('port_http'));
	this.app().listen(Config.get('port'));
};

App.validator = function() {
    if (this.validator_module === null) {
        this.validator_module = require("validator");
    }
    return this.validator_module;
};

App.push = function() {
    if (this.push_module === null) {
        this.push_module = require(__root_dir + '/helpers/Push').Push;
    }
    return this.push_module;
};

App.formatter = function() {
    if (this.formatter_module === null) {
        this.formatter_module = require(__root_dir + '/helpers/Formatter').Formatter;
    }
    return this.formatter_module;
};

App.sha1 = function(str) {
    if (this.sha1_module === null) {
        this.sha1_module = require('sha1');
    }
    return this.sha1_module(Config.get('salt') + str);
};

App.i18n = function() {
    if (this.lang_module === null) {
        let i18n = require("i18n");
        i18n.configure({
            locales: Config.get('locale_values'),
            directory: Config.get('locale_directory'),
            register: global
        });
        this.lang_module = i18n;
    }
    return this.lang_module;
};

App.db = function() {
    if (this.db_module === null) {
        const db = require(__root_dir + '/config/database.js').db;
        this.db_module = db;
        this.sequelize_module = db.Sequelize;
    }
    return this.db_module;
};

App.redis = function() {
    if (this.redis_module === null) {
        this.redis_module = require('redis').createClient();
    }
    return this.redis_module;
};

App.geo = function() {
    if (this.redis_geo_module === null) {
        this.redis_geo_module = require('georedis').initialize(this.redis(), {
            zset: 'user:locations'
        });
    }
    return this.redis_geo_module;
};

App.Sequelize = function() {
    if (this.sequelize_module === null) {
        const db = require(__root_dir + '/config/database.js').db;
        this.db_module = db;
        this.sequelize_module = db.Sequelize;
    }
    return this.sequelize_module;
};

App.eventEmitter = function() {
    if (this.events_module === null) {
        const EventEmitter = require('events').EventEmitter;
        this.events_module = new EventEmitter();
    }
    return this.events_module;
};

App.app = function() {
    if (this.app_module === null) {
        const express = require('express');
        this.app_module = express();
    }
    return this.app_module;
};

App.expressWs = function() {
    if (this.express_ws_module === null) {
        this.express_ws_module = require('express-ws')(this.app());
    }
    return this.express_ws_module;
};

module.exports.App = App;
