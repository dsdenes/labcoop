var Backbone = require('backbone');

var App = require('app');
var debug = App.debugFactory('model:items');

var Model = Backbone.Model.extend({
  
  urlRoot: '/api/items'
  
});

var Collection = Backbone.Collection.extend({
  
  model: Model,
  url: '/api/items',
  
  onDestroy: function() {
    console.log('destroyyyeeed');
  }
  
});

module.exports = {
  Model: Model,
  Collection: Collection
};