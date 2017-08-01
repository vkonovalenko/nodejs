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
    
	static exts() {
		return ['png', 'jpg', 'jpeg'];
	}
	
//    const uuidV4 = require('uuid/v4');
    static uploadPhoto(request, response) {
		let req = request.query;
		if (Helper.isVar(req.api_token)) {
			Model.get('User').findOne({
			  where: {token: req.api_token}
			}).then(function(user) {
				if(user) {
					if (request.files.length) {
						const ext = request.files[0].originalname.split(".").pop().toLowerCase();
						if (Helper.inArray(ext, UserController.exts())) {
							const fileName = request.files[0].filename;
							const src = "/" + fileName;
							let file = {src: src, userId: user.id};
							Model.get('UploadedFile').create(file).then(function(created_file) {
								let formatted = {
									id: created_file.id,
									src: created_file.src
								};
								response.send(Response.http(formatted, 'file_uploaded'));
							}, function(error) {
								console.log(error);
								response.send(Response.http({}, 'file_uploading_error'));
							});
						} else {
							response.send(Response.http({}, 'invalid_file_format'));
						}
					} else {
						response.send(Response.http({}, 'no_files_to_upload'));
					}
//					response.send(Response.http({}, 'no_files_to_upload'));
				} else {
					response.send(Response.http({}, 'do_login', 'Неправильный логин или пароль.'));
				}
			});
		} else {
			response.send(Response.http({}, 'do_login', 'Неправильный логин или пароль.'));
		}
    }
    
}

module.exports.UserController = UserController;