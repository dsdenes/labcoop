var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminContents:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'admin/contents/:type': 'adminContents'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;