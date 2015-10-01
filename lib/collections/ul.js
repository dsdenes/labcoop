var $ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');

var App = require('app');

var ItemView = require('../views/li');
var EmptyView = require('../views/li-empty');

module.exports = App.Backbone.Marionette.CollectionView.extend({

  template: Handlebars.compile('<ul></ul>'),

  childView: ItemView,
  emtpyView: EmptyView,
  
  setChecked: function(tags) {
    
    this.options.checked = tags; 
    
    if (this.collection.length) {
      for (var model of this.collection.models) {
        model.setChecked(this.options.checked);
      }
    }
  },
  
  childViewOptions: function() {
        
    return this.options.checked ? {
      checked: this.options.checked
    } : {};
    
    //return _.extend({}, this.options);
    
  }
  
});