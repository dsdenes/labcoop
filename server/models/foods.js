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
  
  food: { type: String, required: true }, 
  calories: { type: Number, required: true }, 
  
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now }

});

schema.statics.addFood = function(foodData) {
  return q.ninvoke(this, 'create', foodData);
};

let Model = db.model('Foods', schema);

module.exports = Model;
