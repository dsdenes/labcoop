var App = require('app');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:addcase', function() {
  
  App.layout.showChildView('content', new LayoutView());
  
});