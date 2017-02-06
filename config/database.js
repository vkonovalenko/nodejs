"use strict";

const DB_NAME = "findme";
const DB_USER_NAME = "root";
const DB_USER_PASS = "7777777";

let Sequelize = require('sequelize');
let db = new Sequelize(DB_NAME, DB_USER_NAME, DB_USER_PASS);

module.exports.db = db;
module.exports.Sequelize = Sequelize;