"use strict";

/*
 * search needle value in haystack
 */
function search(needle, haystack) {
  var keysArr = typeof haystack !== 'string' ? Object.keys(haystack) : false;
  var i;
  var buffer = '';

  for (i = 0; i < keysArr.length; i++) {
    if (haystack[keysArr[i]] === needle) {
      return keysArr[i];
    } else if (search(needle, haystack[keysArr[i]])) {
      buffer += keysArr[i];
      if (haystack[keysArr[i]] instanceof Array) {
        return buffer + '[' + search(needle, haystack[keysArr[i]]) + ']';
      }
      return buffer + '.' + search(needle, haystack[keysArr[i]]);
    }
  }
  return false;
}

class Response {
    
    static socket(command, data, message) {
        if (Helper.isNo(message)) {
            message = '';
        }
        const send_data = {
            command: command,
            data: data,
            message: message
        };
        return JSON.stringify(send_data);
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
            data: data,
            message: message
        };
        return JSON.stringify(send_data);
    }
}

module.exports.Response = Response;