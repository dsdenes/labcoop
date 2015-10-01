var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminItemsForm:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'admin/content/add/:type': 'adminContentsFormAdd',
    'admin/content/edit/:type/:id': 'adminContentsFormEdit'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;