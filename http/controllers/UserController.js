"use strict";

let User = require('../../models/User').User;

// @TODO: rewrite this holly shit
function getArray(vr) {
	vr = (vr) ? vr : []; // user 2
	if (isJson(vr)) {
		vr = JSON.parse(vr);
	} else {
		vr = [];
	}
	return vr;
}
function getDbJson(arr) {
	return '[' + arr.join(',') + ']';
}
// -------------------------------

class UserController {
    
    static uploadPhoto(request, response) {
        if (request.files) {
            const fileName = request.files.file.name;
//            console.log(request.files);
            const src = "public/uploads/" + fileName;
            request.files.file.mv('./' + src, function (err) {
                if (!err) {
                    let UploadedFile = require('../../models/UploadedFile').UploadedFile;
                    App.db().sync().then(function () {
                        let file = {src: src};
                        return UploadedFile.create(file);
                    }).then(function (insertedRow) {
                        Response.http({}, 'file_uploaded');
                    }, function (error) {
                        Response.http({debug: 'cant save into db.'}, 'file_uploading_error');
                    });
                } else {
                    Response.http({}, 'file_uploading_error');
                }
            });
        } else {
            Response.http({}, 'no_files_to_upload');
        }
    }
    
}

module.exports.UserController = UserController;

/*
 * 1. Ищем токен в redis
 * 2. Если не находим - ищем токен в бд, находим - пишем в redis
 * 3. Когда юзер уходит в оффлайн удалять token из redis
 */