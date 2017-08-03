"use strict";

let UserPhoto = App.db().define('user_photos', {
  src: Seq.STRING,
  userId: Seq.INTEGER
});

module.exports.UserPhoto = UserPhoto;