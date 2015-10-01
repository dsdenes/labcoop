var Backbone = require('backbone');

var App = require('app');
var debug = App.debugFactory('model:images');

var Model = Backbone.Model.extend({
  
  //urlRoot: '/api/images'
  
});

var Collection = Backbone.Collection.extend({
  
  initialize: function(valami, options) {
    this.url = options.url;
  },
  
  url: function() {
    //console.log(this.url);
    return this.url;
  },
  
  parse: function(response) {
    this.images = response;
    return response;
  },
  
  model: Model
  
});

module.exports = {
  Model: Model,
  Collection: Collection
};