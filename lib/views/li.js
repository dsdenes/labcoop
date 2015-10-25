var $ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');

var App = require('app');

module.exports = App.Backbone.Marionette.ItemView.extend({
  
  tagName: 'li',
  
  initialize: function() {
    
  },
  
  attributes: function() {
    return {
      value: this.model.get('name')
    }
  },
  
  template: Handlebars.compile('{{name}}'),
  
  modelEvents: {
    'change': 'modelChanged'
  },
  
  modelChanged: function() {
   
  }

});