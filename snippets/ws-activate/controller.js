var App = require('app');
var router = require('./router');
var LayoutView = require('./layout');
var Auth = require('../../lib/auth');
var co = require('co');

router.on('route:activate', function(username, token) {
  
  App.layout.showChildView('content', new LayoutView({
    username: username,
    token: token
  }));
  
});
