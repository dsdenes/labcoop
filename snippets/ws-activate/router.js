var App = require('app');

var router = new (App.Backbone.Router.extend({   

  routes: {
    'activate/:username/:token': 'activate'
  }
  
}));

module.exports = router;