var App = require('app');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'login': 'login',
    'login/back/:where': 'login'
  }
  
}));

module.exports = router;