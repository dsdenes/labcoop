"use strict";

var mongoose = require('mongoose');

var q = require('q');
var _ = require('underscore');
var l = require('../core/lib/logger');
var shortid = require('shortid');

var db = require('../core/db');

var schema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  
  user_id: { type: String, required: true }, 
  datetime: { type: Date, default: Date.now },
  calories: { type: Number, required: true }, 

});

schema.statics.addCase = function(caseData) {
  return q.ninvoke(this, 'create', caseData);
};

let Model = db.model('Cases', schema);

module.exports = Model;
