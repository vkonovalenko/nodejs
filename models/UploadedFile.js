"use strict";

let UploadedFile = App.db().define('uploaded_files', {
  src: Seq.STRING,
  userId: Seq.INTEGER
});

module.exports.UploadedFile = UploadedFile;