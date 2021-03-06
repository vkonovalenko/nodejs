"use strict";

class Helper {
    
    static isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    
    static isVar(variable) {
        if (typeof variable !== 'undefined') {
            if (variable !== null) {
                return true;
            }
        }
        return false;
    }
    
    static isNo(variable) {
        return (typeof variable === 'undefined');
    }
    
    static inArray(key, arr) {
		if (arr.indexOf(key.toString()) !== -1 ) {
			return true;
		}
        return (arr.indexOf(parseInt(key, 10)) !== -1);
    }
    
    static checkParams(json_data, params) {
        params.forEach(function(item) {
            if (!json_data[item]) {
                return false;
            }
        });
        return true;
    }
    
    static leftKeys(data, keys) {
        let result = {};
        Object.keys(data).forEach(function(key) {
            if (keys.includes(key)) {
                result[key] = data[key];
            }
        });
        return result;
    }
    
    static unsetKeys(data, keys) {
        Object.keys(data).forEach(function(key) {
            if (keys.includes(key)) {
                delete data[key];
            }
        });
        return data;
    }
    
    static getDbArray(arr) {
        let result = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] !== null && arr[i] !== undefined) {
                result.push(arr[i]);
            }
        }
        return '{' + result.join(',') + '}';
    }
}

module.exports.Helper = Helper;