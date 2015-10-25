var Backbone = require('backbone');

var App = require('app');
var debug = App.debugFactory('model:users');

var Model = Backbone.Model.extend({
  
  urlRoot: '/api/users'
  
});

var Collection = Backbone.Collection.extend({
  
  model: Model,
  url: '/api/jobs'
  
});

module.exports = {
  Model: Model,
  Collection: Collection
};