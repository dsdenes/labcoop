var $ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');

var App = require('app');

var UlCollection = require('./ul.js');
var ItemView = require('../views/li-checkbox');

module.exports = UlCollection.extend({

  childView: ItemView
  
});