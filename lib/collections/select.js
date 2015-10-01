var $ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');

var App = require('app');

var ItemView = require('../views/option');
var EmptyView = require('../views/option-empty');

module.exports = App.Backbone.Marionette.CollectionView.extend({

  template: Handlebars.compile('<select></select>'),

  childView: ItemView,
  emtpyView: EmptyView

});