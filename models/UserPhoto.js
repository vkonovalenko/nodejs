"use strict";

let UserPhoto = App.db().define('user_photos', {
  src: Seq.STRING
});

module.exports.UserPhoto = UserPhoto;