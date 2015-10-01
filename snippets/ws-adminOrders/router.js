var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminOrders:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'admin/orders': 'adminOrders'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;