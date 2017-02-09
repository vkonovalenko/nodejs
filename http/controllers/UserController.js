"use strict";

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