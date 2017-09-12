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
    static uploadPhotos(request, response) {
		
		console.log('UPLOAD ACTION');
		let req = request.query;
		console.log(request);
		if (Helper.isVar(req.api_token)) {
			Model.get('User').findOne({
			  where: {token: req.api_token}
			}).then(function(user) {
				if(user) {
					if (request.files.length) {
						let uuidV4 = require('uuid/v4');
						let fs = require('fs');
						let ext = null;
						let path = null;
						let fileName = null;
						let src = null;
						let formattedFiles = [];
						//let filesLength = request.files.length - 1;
						
						function sendResponse(err, formattedFiles) {
							console.log('-------------------------------');
							console.log(formattedFiles);
							
							if (formattedFiles.length) {
								response.send(Response.http({photos: formattedFiles}, 'files_uploaded'));
							}
						}
						
						let async = require('async');
						function uploadFile(file, callback) {
							process.nextTick(function() {
								
								ext = file.originalname.split(".").pop().toLowerCase();
								path = file.path;

								if (Helper.inArray(ext, UserController.exts())) {
									fileName = uuidV4() + '.' + ext;
									fs.rename(Config.get('app_path') + path, Config.get('app_path') + 'public/uploads/' + fileName, function(err) {
										if ( err ) {
											console.log('ERROR: ' + err);
										}
									});
									src = "/" + fileName;
									file = {src: src, userId: user.id};

									Model.get('UserPhoto').create(file).then(function(created_file) {

										formattedFiles.push({
											id: created_file.id,
											src: Config.get('image_url') + created_file.src
										});

										if(Helper.isVar(req.avatar) == true) {
											Model.get('User').update({avatar: created_file.src}, {where: {id: user.id}});
											let ws = Socket.clients(user.id);
											if (ws) {
												ws.avatar = created_file.src;
												formattedFiles = [];
												Response.socket(ws, 'avatar', {avatar: created_file.src});
											}
										}
									}, function(error) {
										console.log(error);
									});
								} else {
									response.send(Response.http({}, 'invalid_file_format'));
								}
								
								callback(null, file);
							});
						}
						
						async.map(request.files, uploadFile, sendResponse);
						
					} else {
						response.send(Response.http({}, 'no_files_to_upload'));
					}
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