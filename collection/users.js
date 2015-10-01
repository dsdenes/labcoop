var App = require('app');
var debug = App.debugFactory('collection:items');

var Model = require('model/item');

module.exports = App.Backbone.Collection.extend({
  url: '/users',
  model: Model
});