"use strict";

class UserController {
    
    static __getFileExt(mimetype) {
        const mimetypes = {
            'image/jpeg': '.jpeg',
            'image/pjpeg': '.jpeg',
            'image/png': '.png'
        };
        if (mimetypes[mimetype]) {
            return mimetypes[mimetype];
        } else {
            return false;
        }
    }
    
//    const uuidV4 = require('uuid/v4');
    static uploadPhoto(request, response) {
        if (request.files) {
            console.log(request.files);
            const ext = UserController.__getFileExt(request.files.file.mimetype);
            if (ext) {
                const uuidV4 = require('uuid/v4');
                const fileName = uuidV4() + ext;
                const src = "public/uploads/" + fileName;
                request.files.file.mv('./' + src, function (err) {
                    if (!err) {
                        let UploadedFile = require('../../models/UploadedFile').UploadedFile;
                        App.db().sync().then(function () {
                            let file = {src: src};
                            return UploadedFile.create(file);
                        }).then(function (insertedRow) {
                            response.send(Response.http({}, 'file_uploaded'));
                        }, function (error) {
                            response.send(Response.http({debug: 'cant save into db.'}, 'file_uploaded'));
                        });
                    } else {
                        response.send(Response.http({}, 'file_uploading_error'));
                    }
                });
            } else {
                response.send(Response.http({}, 'invalid_file_format'));
            }
        } else {
            response.send(Response.http({}, 'no_files_to_upload'));
        }
    }
    
}

module.exports.UserController = UserController;