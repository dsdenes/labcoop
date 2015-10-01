var path = require('path');
var App = require('app');
var debug = App.debugFactory('snippet:content:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'content/:id': 'content'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;