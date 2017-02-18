"use strict";

let User = App.db().define('users', {
  token: Seq.STRING,
  email: Seq.STRING,
  avatar: Seq.STRING,
  deviceOs: Seq.STRING,
  phone: Seq.STRING,
  password: Seq.STRING,
  firstName: Seq.STRING,
  lastName: Seq.STRING,
  nickName: Seq.STRING,
  requestsTo: Seq.STRING,
  requestsFrom: Seq.STRING,
  friends: Seq.STRING,
  hiddenFriends: Seq.STRING,
  allowFriends: Seq.INTEGER,
  allowRandom: Seq.INTEGER,
  meetsCount: Seq.INTEGER,
  wasOnline: Seq.STRING
});

module.exports.User = User;