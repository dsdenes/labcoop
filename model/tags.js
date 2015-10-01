var Backbone = require('backbone');
var format = require('util').format;

var App = require('app');
var debug = App.debugFactory('model:items');

var Model = Backbone.Model.extend({
  
  defaults: {
    'type': null,
    'name': null
  }
  
});

var Collection = Backbone.Collection.extend({
  
  initialize: function(models, options) {
    if (options.type) {
      this.url = format('/api/tags/filter/%s', options.type);
    } else {
      this.url = '/api/tags';
    }
  },
  
  model: Model
  
});

module.exports = {
  Model: Model,
  Collection: Collection
};