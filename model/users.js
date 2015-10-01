var Backbone = require('backbone');

var App = require('app');
var debug = App.debugFactory('model:users');

var Model = Backbone.Model.extend({
  
  validate: function(attrs, options) {
    return 'text validation error'
  },
  
  defaults: {
    'name':         null,
    'description':  null,
    'price':        null
  }
  
});

var Collection = Backbone.Collection.extend({
  
  model: Model 
  
});

module.exports = {
  Model: Model,
  Collection: Collection
};