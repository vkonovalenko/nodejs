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
		console.log('UPLOAD ACTION');
		let req = request.query;
		console.log(request);
		if (Helper.isVar(req.api_token)) {
			Model.get('User').findOne({
			  where: {token: req.api_token}
			}).then(function(user) {
				if(user) {
					if (request.files.length) {
						const ext = request.files[0].originalname.split(".").pop().toLowerCase();
						const path = request.files[0].path;
						if (Helper.inArray(ext, UserController.exts())) {
							let uuidV4 = require('uuid/v4');
							const fileName = uuidV4() + '.' + ext;
							
							let fs = require('fs');
							fs.rename(Config.get('app_path') + path, Config.get('app_path') + 'public/uploads/' + fileName, function(err) {
								if ( err ) {
									console.log('ERROR: ' + err);
								}
							});
							
							const src = "/" + fileName;
							let file = {src: src, userId: user.id};
							Model.get('UploadedFile').create(file).then(function(created_file) {
								let formatted = {
									id: created_file.id,
									src: Config.get('image_url') + created_file.src
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