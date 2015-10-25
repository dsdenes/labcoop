var App = require('app');
var router = require('./router');
var LayoutView = require('./layout');
var Auth = require('../../lib/auth');
var co = require('co');

router.on('route:account', function() {
  
  App.layout.showChildView('content', new LayoutView());
  
});

router.on('route:logout', function() {

  co(function*() {
    yield Auth.logout();
    App.router.navigate('login', { trigger: true });
  });

});