var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:admin:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'admin': 'admin'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;