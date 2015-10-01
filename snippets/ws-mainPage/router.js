var path = require('path');
var App = require('app');
var debug = App.debugFactory('snippet:mainPage:router');

var router = new (App.Backbone.Router.extend({   

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;