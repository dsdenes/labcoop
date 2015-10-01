var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:mainPage:controller');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:mainPage', function(action) {
  
});

module.exports = router;