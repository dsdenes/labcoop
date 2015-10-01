var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:jobs-list:controller');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:jobs-list', function(filters) {
  
  if (filters) {
    try {
      filters = JSON.parse(atob(filters));
    } catch (e) {
      filters = null;
    }
  } 
  
  // render to the main content part
  App.layout.showChildView('content', new LayoutView({
    filters: filters
  }));
  
});

module.exports = router;