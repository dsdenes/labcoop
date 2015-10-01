var path = require('path');
var App = require('app');
var debug = App.debugFactory('snippet:basket:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'kosar': 'basket'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;
