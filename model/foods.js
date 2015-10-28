import Backbone from 'backbone'

const Model = Backbone.Model.extend({
  
  urlRoot: '/api/foods',
  idAttribute: "_id"
  
});

const Collection = Backbone.Collection.extend({
  
  model: Model,
  url: '/api/foods'
  
});

export { Model };
export { Collection };
