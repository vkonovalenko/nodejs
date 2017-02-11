"use strict";

let Meeting = App.db().define('meetings', {
  userFrom: Seq.INTEGER,
  userTo: Seq.INTEGER,
  status: Seq.INTEGER,
  expiredAt: Seq.INTEGER
});

Meeting.belongsTo(Model.get('User'), {as: 'sender', foreignKey: 'userFrom', targetKey: 'id'});
Meeting.belongsTo(Model.get('User'), {as: 'receiver', foreignKey: 'userTo', targetKey: 'id'});

module.exports.Meeting = Meeting;