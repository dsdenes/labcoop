var path = require('path');
var App = require('app');
var debug = App.debugFactory('snippet:jobs-list:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'jobs': 'jobs-list',
    'jobs/:filters': 'jobs-list'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;