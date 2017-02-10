"use strict";

let Meeting = App.db().define('meetings', {
  userFrom: Seq.INTEGER,
  userTo: Seq.INTEGER,
  status: Seq.INTEGER
});

module.exports.Meeting = Meeting;