var $ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');
var _s = require('underscore.string');

var App = require('app');

module.exports = App.Backbone.Marionette.ItemView.extend({
  
  tagName: 'li',
  
  initialize: function() {
    
  },
  
  attributes: function() {
    return {
      // _s.slugify(this.model.get('name'))
      value: this.model.get('name')
    }
  },
  
  template: Handlebars.compile('{{name}}'),
  
  modelEvents: {
    'change': 'modelChanged'
  },
  
  modelChanged: function() {
    //console.log('modelChanged');
  }

});