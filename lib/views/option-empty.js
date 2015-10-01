var $ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');

var App = require('app');

module.exports = App.Backbone.Marionette.ItemView.extend({

  template: Handlebars.compile('<option>Üres lista</option>')

});