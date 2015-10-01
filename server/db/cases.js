var mongoose = require('mongoose');

var q = require('q');
var _ = require('underscore');
var l = require('../logger');
var shortid = require('shortid');

var db = require('./db');

var schema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  },
  user_id: String,
  lawyer_id: String,
  sales_id: String,
  type_tags: Array, // tags of case type
  status: String, // no_case|no_lawyer|no_other|resolved|wait_salescall|wait_lawyersearch|wait_pay|wait_lawyercall|wait_userinfo
  nextrole: String, // lawyer|salesrep|user
  
  review_rate: Number,
  review_text: String,

  attachments: Array,
  notes: Array,
  
  created: Date,
  resolved: Date,
  lastEvent: Date,
  lastUserEvent: Date,
  lastSalesEvent: Date,
  lastLawyerEvent: Date,
  
  events: Array
  /*
  [{
    date: Date,
    type: 'call|note|attachment',
    who: 'lawyer|salesrep|user'
  }]
  */
  
});

module.exports = db.model('Cases', schema);