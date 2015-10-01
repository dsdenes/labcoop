var path = require('path');
var App = require('app');
var debug = App.debugFactory('snippet:postcards-list:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'kepeslapok': 'postcards-list',
    'kepeslapok/:filters': 'postcards-list'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;