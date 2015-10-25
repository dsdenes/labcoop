var Backbone = require('backbone');

var Model = Backbone.Model.extend({
  
  urlRoot: '/api/cases'
  
});

var Collection = Backbone.Collection.extend({
  
  model: Model,
  url: '/api/cases'
  
});

module.exports = {
  Model: Model,
  Collection: Collection
};