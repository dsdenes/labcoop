var mongoose = require('mongoose');

var q = require('q');
var _ = require('underscore');
var l = require('../logger');

var db = require('./db');

var schema = new mongoose.Schema({
  name: String,
  type: String, // case|
  parent: String  
});

module.exports = db.model('Tags', schema);