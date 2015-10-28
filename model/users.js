import Backbone from 'backbone'

const Model = Backbone.Model.extend({
  
  urlRoot: '/api/users',
  idAttribute: "_id"
  
});

const Collection = Backbone.Collection.extend({
  
  model: Model,
  url: '/api/users'
  
});

export { Model };
export { Collection };
