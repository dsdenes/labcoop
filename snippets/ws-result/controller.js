var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:result:controller');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:search-result', function(query) {
  
  // render to the main content part
  App.layout.showChildView('content', new LayoutView({
    query: query
  }));
  
});

module.exports = router;