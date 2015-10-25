var App = require('app');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'account': 'account',
    'account/logout': 'logout'
  }
  
}));

module.exports = router;