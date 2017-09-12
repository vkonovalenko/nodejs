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
		
		async function executeParallelAsyncTasks () {  
		  const [ valueA, valueB, valueC ] = await Promise.all([ functionA(), functionB(), functionC() ]);
		  doSomethingWith(valueA);
		  doSomethingElseWith(valueB);
		  doAnotherThingWith(valueC);
		};
		
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
						let formattedFile = null;
						let formattedFiles = [];
						let filesLength = request.files.length - 1;
						
						function sendResponse(formattedFiles) {
							console.log('-------------------------------');
							console.log(formattedFiles);
							response.send(Response.http({photos: formattedFiles}, 'files_uploaded'));
						}
						
						request.files.forEach(function(file, i) {
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
									formattedFile = {
										id: created_file.id,
										src: Config.get('image_url') + created_file.src
									};
									
									formattedFiles.push(formattedFile);
									
									if(Helper.isVar(req.avatar) == true) {
										Model.get('User').update({avatar: created_file.src}, {where: {id: user.id}});
										let ws = Socket.clients(user.id);
										if (ws) {
											console.log('AVATAR UPDATING.............');
											ws.avatar = created_file.src;
											
											Response.socket(ws, 'avatar', {avatar: created_file.src});
										}
									}
									
									if (filesLength == i) {
										sendResponse(formattedFiles);
									}
									
								}, function(error) {
									console.log(error);
								});
							} else {
								response.send(Response.http({}, 'invalid_file_format'));
							}
						});
						
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