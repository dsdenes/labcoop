var Backbone = require('backbone');

var App = require('app');
var debug = App.debugFactory('model:contents');

var Model = Backbone.Model.extend({
  
  urlRoot: '/api/contents'
  
});

var Collection = Backbone.Collection.extend({
  
  model: Model,
  url: '/api/contents'
  
});

module.exports = {
  Model: Model,
  Collection: Collection
};