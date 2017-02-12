"use strict";

let fileUpload = require('express-fileupload');

App.app().use('/users/upload_photo', fileUpload());