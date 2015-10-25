var mongoose = require('mongoose');

var q = require('q');
var _ = require('underscore');
var l = require('../core/lib/logger');

var shortid = require('shortid');
var Hash = require('password-hash');

var db = require('../core/db');

var schema = new mongoose.Schema({

  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  
  token: { type: String },
  
  name: { type: String },
  
  username: { type: String, required: true, trim: true },
  password: { 
    type: String, 
    set: (_password) => {
      return Hash.isHashed(_password) ? _password : Hash.generate(_password);
    } 
  },
  email: { type: String, required: true, trim: true, validate: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, "has to be a valid e-mail address"]},
  
  oauth: { type: Object },
  
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now }
  
});

schema.index({ username: 1 }, { unique: true });
schema.index({ email: 1 }, { unique: true });

schema.statics.authenticate = function(username, password, callback) {
  this.findOne({ username: username }, (error, user) => {
    
    if (error) { return callback(error); }
    
    if (user && Hash.verify(password, user.password)) {
      callback(null, user);
    } else if (user || !error) {
      // Email or password was invalid (no MongoDB error)
      callback(null, false);
    } 
  });
};

schema.statics.addUser = function(userData) {
  return q.ninvoke(this, 'create', userData);
};

module.exports = db.model('Users', schema);
