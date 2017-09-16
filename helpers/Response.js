"use strict";

/*
 * search needle value in haystack
 */
function post_process(haystack) {
	
    if (typeof haystack === 'object' && haystack !== null) {
        Object.keys(haystack).forEach(function(key) {
            if (typeof haystack[key] === 'object' && haystack[key] !== null) {
                if (key === 'wasOnline') {
                    haystack[key] = App.moment()(haystack[key], "YYYY-MM-DD H:i:s").fromNow();
                } else {
                    return post_process(haystack[key]);
                }
            } else if (key === 'wasOnline') {
                haystack[key] = App.moment()(haystack[key], "YYYY-MM-DD H:i:s").fromNow();
            }
            
            if (haystack[key] === null) {
                haystack[key] = '';
            } else if (typeof haystack[key] === 'undefined') {
                haystack[key] = '';
            } else if (typeof haystack[key] === 'number') {
                haystack[key] = haystack[key].toString();
            } else if (haystack[key] instanceof Array) {
                return post_process(haystack[key]);
            } else {
                if (key === 'avatar' || key === 'src') {
                        haystack[key] = Config.get('image_url') + haystack[key];
                }
            }
        });
    }
  return haystack;
}

class Response {
    
    static socket(ws, command, data, message) {
        if (Helper.isNo(message)) {
            message = '';
        }
        const send_data = {
            command: command,
            data: post_process(data),
            message: message
        };
		if (ws.readyState == 1) {
			ws.send(JSON.stringify(send_data));
		}
    }
    
    static http(data, command, message ) {
        if (Helper.isNo(command)) {
            command = '';
        }
        if (Helper.isNo(message)) {
            message = '';
        }
        
        const send_data = {
            command: command,
            data: post_process(data),
            message: message
        };
        return JSON.stringify(send_data);
    }
}

module.exports.Response = Response;