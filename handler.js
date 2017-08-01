"use strict";

let Handler = {};
//function Handler() {};
Handler.sockets_events = {};
Handler.sockets_controllers = {};
Handler.sockets_middlewares = {};
Handler.http_middlewares = {};

Handler.listenHttp = function() {
	let multer  = require('multer');
	let upload = multer();
    const httpRoutes = require(__root_dir + '/http/routes/routes');
    const routes = httpRoutes.routes;
    const middlewares = httpRoutes.middlewares;
    
    // load middlewares
    let middleware = null;
    Object.keys(middlewares).forEach(function(key) {
        for (let i = 0; i < middlewares[key].length; i++) {
            if(Helper.isNo(Handler.http_middlewares[middlewares[key][i]])) {
                middleware = require(__root_dir + '/http/middlewares/' + middlewares[key][i]);
                Handler.http_middlewares[middlewares[key][i]] = middleware[middlewares[key][i]];
                middleware = null;
            }
        }
    });
    let routesControllers = {};
    for (let i = 0; i < routes.length; i++) {
        let handlerArr = routes[i].handler.split('.');
        if (typeof routesControllers[handlerArr[0]] === 'undefined') {
            const controllerModule = require('./http/controllers/' + handlerArr[0]);
            routesControllers[handlerArr[0]] = controllerModule[handlerArr[0]];
        }
        if (Helper.isVar(middlewares[routes[i].url])) {
            for (let j = 0; j < middlewares[routes[i].url].length; j++) {
                middleware = Handler.http_middlewares[middlewares[routes[i].url][j]];
                // attach middleware
                App.app().use(routes[i].url, middleware);
                middleware = null;
            }
        }
        // bind controller/action
        App.app().post(routes[i].url, upload.array(), routesControllers[handlerArr[0]][handlerArr[1]]);
    }
};

Handler.listenSockets = function() {
    let socketRoutes = require(__root_dir + '/sockets/routes/routes');
    const events = socketRoutes.events;
    const routes = socketRoutes.routes;
    const middlewares = socketRoutes.middlewares;
    socketRoutes = null;
    let event = null;
    // load events
    Object.keys(events).forEach(function(key) {
        if(typeof Handler.sockets_events[key] === 'undefined') {
            event = require(__root_dir + '/sockets/events/' + events[key]);
            Handler.sockets_events[key] = event[events[key]];
            event = null;
        }
    });
    // load controllers
    let handlerArr = null;
    let controller_name = null;
    let action_name = null;
    Object.keys(routes).forEach(function(key) {
        handlerArr = routes[key].split('.');
        controller_name = handlerArr[0];
        action_name = handlerArr[1];
        if(Helper.isNo(Handler.sockets_controllers[controller_name])) {
            let controller = require(__root_dir + '/sockets/controllers/' + controller_name);
            Handler.sockets_controllers[key] = controller[controller_name][action_name];
            controller = null;
        }
    });
    // load middlewares
    let middleware = null;
    Object.keys(middlewares).forEach(function(key) {
        for (let i = 0; i < middlewares[key].length; i++) {
            if(Helper.isNo(Handler.sockets_middlewares[middlewares[key][i]])) {
                middleware = require(__root_dir + '/sockets/middlewares/' + middlewares[key][i]);
                Handler.sockets_middlewares[middlewares[key][i]] = middleware[middlewares[key][i]];
                middleware = null;
            }
        }
    });
    if(typeof Handler.sockets_events.connection !== 'undefind') {
        App.expressWs().getWss().on('connection', Handler.sockets_events.connection.handle);
    }
    App.app().ws('/sockets', function (ws, request) {
        Object.keys(Handler.sockets_events).forEach(function(key) {
            if (key !== 'connection' && key !== 'message') {
                ws.on(key, Handler.sockets_events[key].handle);
            } else if (key === 'message') {
                ws.on('message', function(msg) {
                    // execute message event
                    let data = Handler.sockets_events[key].handle(msg);
                    if (data) {
                        let params = {};
                        if (data.data) {
                            params = data.data;
                        }
                        if (Helper.isVar(data.command)) {
                            // MIDDLEWARES
                            if (Helper.isVar(middlewares[data.command])) {
                                // @TODO: make refactoring and do it async
                                let middleware = null;
                                let class_name = null;
                                for (let i = 0; i < middlewares[data.command].length; i++) {
                                    class_name = middlewares[data.command][i];
                                    middleware = new Handler.sockets_middlewares[class_name]();
                                    Promise.all([middleware.handle(params, ws)]).then(function(result) {
                                        result = null;
                                        if (Helper.isNo(middlewares[data.command][i+1])) {
                                            if (Helper.isVar(routes[data.command])) {
                                                // execute command
                                                Handler.sockets_controllers[data.command](ws, params);
                                            } else {
                                                ws.send('command does not exists.');
                                            }
                                        }
                                    }).catch(function(error) {
                                        error = null;
                                        //middleware didn't pass
                                    });
                                }
                            } else {
                                if (Helper.isVar(routes[data.command])) {
                                    // execute command
                                    Handler.sockets_controllers[data.command](ws, params);
                                } else {
                                    ws.send('command does not exists.');
                                }
                            }
                        } else {
                            ws.send('command is empty');
                        }
                    } else {
                        ws.send('incorrect json');
                    }
                });
            }
        });
    });
};

module.exports.Handler = Handler;