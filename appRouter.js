var App = require('./app');
var debug = App.debugFactory('app:appRouter');

var router = new (App.Backbone.Router.extend({   

  routes: {
    '': 'default'
  },

  initialize: function() {
    debug('initialize');
  }
  
}));

router.on('route:default', function(params) {
  App.layout.render();
});

module.exports = router;