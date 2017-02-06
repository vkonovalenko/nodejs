"use strict";

class Model {
	
	static get(modelName) {
		if (typeof Model.models === 'undefined') {
			Model.models = {};
		}
		if (!Model.models[modelName]) {
			Model.models[modelName] = require(__root_dir  + '/models/' + modelName)[modelName];
		}
		return Model.models[modelName];
	}
	
}

module.exports.Model = Model;