var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminItems:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'admin/items/:type': 'adminItems'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;