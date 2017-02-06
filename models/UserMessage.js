"use strict";

let UserMessage = App.db().define('user_messages', {
  userFrom: Seq.INTEGER,
  userTo: Seq.INTEGER,
  message: Seq.STRING,
  isDelivered: Seq.BOOLEAN
});

UserMessage.belongsTo(Model.get('User'), {as: 'sender', foreignKey: 'userFrom', targetKey: 'id'});

module.exports.UserMessage = UserMessage;