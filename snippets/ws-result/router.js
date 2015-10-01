var path = require('path');
var App = require('app');
var debug = App.debugFactory('snippet:result:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'search-result/:query': 'search-result'
  }
  
}));

module.exports = router;