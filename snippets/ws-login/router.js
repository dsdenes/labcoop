var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:login:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'login': 'login'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;