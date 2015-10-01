var path = require('path');
// from .build
var App = require('app');
var debug = App.debugFactory('snippet:basket:controller');
var router = require('./router');
var LayoutView = require('./layout');

router.on('route:basket', function() {
  
  // render to the main content part
  App.layout.showChildView('content', new LayoutView());
  
  /*
  var itemCollection = new (require('collection/items'))();
  
  itemCollection.add({
    name: 'Uj kepeslap',
    description: 'Uj kepeslap leirasa',
    price: 22
  });
  
  debug(JSON.stringify(itemCollection));*/
  
  
  
  
});

module.exports = router;
