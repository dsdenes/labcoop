var Backbone = require('backbone');

var App = require('app');
var debug = App.debugFactory('model:jobs');

var Model = Backbone.Model.extend({
  
  urlRoot: '/api/jobs'
  
});

var Collection = Backbone.Collection.extend({
  
  model: Model,
  url: '/api/jobs'
  
});

module.exports = {
  Model: Model,
  Collection: Collection
};