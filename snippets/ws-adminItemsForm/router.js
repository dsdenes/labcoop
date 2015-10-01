var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:adminItemsForm:router');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'admin/item/add/:type': 'adminItemsFormAdd',
    'admin/item/edit/:type/:id': 'adminItemsFormEdit'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

module.exports = router;