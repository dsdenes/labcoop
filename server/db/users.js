var mongoose = require('mongoose');

var q = require('q');
var _ = require('underscore');
var l = require('../logger');
var passportLocalMongoose = require('passport-local-mongoose');
var shortid = require('shortid');

var db = require('./db');

var schema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  
  name: { type: String, },
  type: { type: String, required: true, validate: [/^user|lawyer|salesrep|administrator$/, "isn't supported type"] },
  
  email: { type: String, unique: true, trim: true, validate: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, "has to be a valid e-mail address"]},
  phone: { type: String, validate: [/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i, "has to be a valid phone"]},
  
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

schema.path('email').index({ unique: true });

schema.plugin(passportLocalMongoose);

module.exports = db.model('Users', schema);