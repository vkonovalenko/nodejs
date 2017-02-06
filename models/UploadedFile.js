"use strict";

let UploadedFile = App.db().define('uploaded_files', {
  src: Seq.STRING
});

module.exports.UploadedFile = UploadedFile;