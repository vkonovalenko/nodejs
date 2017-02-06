"use strict";

function Config() {};

Config.modules = {};

// export name must be the same with filename
Config.get = function(name, filename) {
    if (Helper.isNo(filename)) {
        filename = 'settings';
    }
    const full_path = '/config/' + filename;
    if (Helper.isNo(this.modules[full_path])) {
        const config_module = require(__root_dir + '/config/' + filename);
        this.modules[full_path] = config_module;
    }
    const config = this.modules[full_path][filename];
    return config[name];
};

module.exports.Config = Config;