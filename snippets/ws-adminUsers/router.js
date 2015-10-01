var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminUsers:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'admin/users': 'adminUsers'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;