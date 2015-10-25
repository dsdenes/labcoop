var App = require('app');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'case': 'addCase',
    'case/:id': 'editCase'
  }
  
}));

module.exports = router;