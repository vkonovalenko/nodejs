"use strict";

let fileUpload = require('express-fileupload');

App.app().use('/user/uploadPhoto', fileUpload());