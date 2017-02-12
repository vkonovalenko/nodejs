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
                Model.get('User').findOne({where: {api_token: request.body.api_token}}).then(function(user) {
                    const uuidV4 = require('uuid/v4');
                    const fileName = uuidV4() + ext;
                    const src = "public/uploads/" + fileName;
                    request.files.file.mv('./' + src, function (err) {
                        if (!err) {
                            let file = {src: src, userId: user.id};
                            Model.get('UploadedFile').create(file).then(function(created_file) {
                                let formatted = {
                                    id: created_file.id,
                                    src: created_file.src
                                };
                                response.send(Response.http(formatted, 'file_uploaded'));
                            }, function(error) {
                                console.log(error);
                            });
                        } else {
                            response.send(Response.http({}, 'file_uploading_error'));
                        }
                    });
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